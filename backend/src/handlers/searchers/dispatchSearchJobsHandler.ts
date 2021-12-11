import { isLeft, left } from "fp-ts/lib/Either";
import { getClient as getKeywordStoreClient } from "@src/adapters/keywordStore/client";
import { getClient as getSearchJobsQueueClient } from "@src/adapters/searchJobsQueue/client";
import { makeGetActiveKeywords } from "@src/adapters/keywordStore/getActiveKeywords";
import { SocialMedia, socialMedias } from "@src/domain/models/socialMedia";
import { getConfig } from "@src/lib/config";
import _ from "lodash";
import { KeywordData } from "@src/domain/models/keyword";
import { makeQueueSearchJobs } from "@src/adapters/searchJobsQueue/queueSearchJobs";
import { getLogger } from "@src/lib/logger";
import { defaultMiddlewareStack } from "@src/handlers/middlewares/common";
import { eitherListToDefaultOk } from "@src/domain/ports/shared";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { throwUnexpectedCase } from "@src/lib/runtime";
import { getMinutesAgo, getNow } from "@src/lib/date";
import { makeUpdateKeywordData } from "@src/adapters/keywordStore/updateKeywordData";

const config = getConfig();
const logger = getLogger();

const handler = async () => {
  const keywordStoreClient = getKeywordStoreClient();
  const searchJobsQueueClient = getSearchJobsQueueClient();
  const getActiveKeywordsFn = makeGetActiveKeywords(
    keywordStoreClient,
    config.keywordsTableName
  );
  const queueSearchJobsFn = makeQueueSearchJobs(
    searchJobsQueueClient,
    config.searchJobsQueueTemplateName
  );
  const updateKeywordData = makeUpdateKeywordData(
    keywordStoreClient,
    config.keywordsTableName
  );

  const results = await Promise.all(
    socialMedias.map(async (socialMedia) => {
      const activeKeywordsResult = await getActiveKeywordsFn(
        logger,
        socialMedia
      );
      if (isLeft(activeKeywordsResult)) {
        logger.error("Failed to getActiveKeywords", {
          error: activeKeywordsResult.left,
          socialMedia,
        });
        return left("ERROR");
      }

      const filteredKeywords = filterKeywords(
        socialMedia,
        activeKeywordsResult.right
      );

      const searchJobs = filteredKeywords.map(keywordDataToSearchJob);
      const queueEither = await queueSearchJobsFn(
        logger,
        socialMedia,
        searchJobs
      );
      if (isLeft(queueEither)) {
        return queueEither;
      }

      // update searchedAt for queued keywords/searchObjects
      const now = getNow();
      const updateSearchedAtResults = await Promise.all(
        filteredKeywords.map(
          async (keywordData) =>
            await updateKeywordData(logger, { ...keywordData, searchedAt: now })
        )
      );

      return eitherListToDefaultOk(updateSearchedAtResults);
    })
  );

  fromEither(await eitherListToDefaultOk(results));
};

export const lambdaHandler = defaultMiddlewareStack(handler);

const keywordDataToSearchJob = (keywordData: KeywordData) => {
  return _.omit(keywordData, ["status"]);
};

export const filterKeywords = (
  socialMedia: SocialMedia,
  keywords: KeywordData[]
) => {
  switch (socialMedia) {
    case "twitter":
    case "reddit":
    case "hackernews":
      return keywords;
    case "instagram": {
      // Due to RapidAPI instagram being 404, just skip for now
      return [];

      // Due to RapidAPI limits, instagram searchs needs to be more restricted
      // - https://rapidapi.com/restyler/api/instagram40/pricing
      // - https://docs.google.com/spreadsheets/d/1fS1pXaw-j79P1-mrVHD3agRqLvb-ARYbumLtoRdcKlU/edit#gid=0
      return applyCooldownToKeywords(
        {
          cooldownPeriodInMinutes: 60 * 12, // TODO: increase freq in production
          maxSearchObjectsPerSearch: 10,
        },
        keywords
      );
    }
    case "youtube": {
      // Youtube API quota: https://developers.google.com/youtube/v3/getting-started#quota
      // request cost calc: https://developers.google.com/youtube/v3/determine_quota_cost
      // TODO: request quota extension
      return applyCooldownToKeywords(
        {
          cooldownPeriodInMinutes: 60 * 12, // TODO: increase freq in production
        },
        keywords
      );
    }
    default:
      return throwUnexpectedCase(socialMedia, "filterKeywords");
  }
};

export const applyCooldownToKeywords = (
  {
    cooldownPeriodInMinutes,
    maxSearchObjectsPerSearch,
  }: {
    cooldownPeriodInMinutes?: number;
    maxSearchObjectsPerSearch?: number;
  },
  keywords: KeywordData[]
): KeywordData[] => {
  const allowedSearchedAt = new Date(getMinutesAgo(cooldownPeriodInMinutes));

  const filteredKeywords: KeywordData[] = [];
  for (const keyword of keywords) {
    if (
      maxSearchObjectsPerSearch &&
      filteredKeywords.length == maxSearchObjectsPerSearch
    ) {
      break;
    }

    if (
      cooldownPeriodInMinutes &&
      keyword.searchedAt &&
      new Date(keyword.searchedAt) > allowedSearchedAt
    ) {
      continue;
    }

    filteredKeywords.push(keyword);
  }

  return filteredKeywords;
};
