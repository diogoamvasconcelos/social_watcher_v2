import { isLeft, left } from "fp-ts/lib/Either";
import { getClient as getKeywordStoreClient } from "../adapters/keywordStore/client";
import { getClient as getSearchJobsQueueClient } from "../adapters/searchJobsQueue/client";
import { makeGetActiveKeywords } from "../adapters/keywordStore/getActiveKeywords";
import { SocialMedia, socialMedias } from "../domain/models/socialMedia";
import { getConfig } from "../lib/config";
import _ from "lodash";
import { KeywordData } from "../domain/models/keyword";
import { makeQueueSearchJobs } from "../adapters/searchJobsQueue/queueSearchJobs";
import { getLogger } from "../lib/logger";
import { defaultMiddlewareStack } from "./middlewares/common";
import { eitherListToDefaultOk } from "../domain/ports/shared";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { throwUnexpectedCase } from "../lib/runtime";
import { getHoursAgo, getNow } from "../lib/date";
import { makeUpdateKeywordData } from "../adapters/keywordStore/updateKeywordData";

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
        logger.error(
          `Failed to getActiveKeywords: ${activeKeywordsResult.left}`
        );
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
      // Due to RapidAPI limits, instagram searchs needs to be more restricted
      // - https://rapidapi.com/restyler/api/instagram40/pricing
      // - https://docs.google.com/spreadsheets/d/1fS1pXaw-j79P1-mrVHD3agRqLvb-ARYbumLtoRdcKlU/edit#gid=0
      const maxSearchObjectsPerSearch = 10;
      const cooldownPeriodInHours = 24;
      const allowedSearchedAt = new Date(getHoursAgo(cooldownPeriodInHours));

      const filteredKeywords: KeywordData[] = [];
      for (const keyword of keywords) {
        if (filteredKeywords.length == maxSearchObjectsPerSearch) {
          break;
        }

        if (
          keyword.searchedAt &&
          new Date(keyword.searchedAt) > allowedSearchedAt
        ) {
          continue;
        }

        filteredKeywords.push(keyword);
      }

      return filteredKeywords;
    }
    default:
      return throwUnexpectedCase(socialMedia, "filterKeywords");
  }
};
