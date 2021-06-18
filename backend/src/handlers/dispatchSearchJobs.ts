import { isLeft, left } from "fp-ts/lib/Either";
import { getClient as getKeywordStoreClient } from "../adapters/keywordStore/client";
import { getClient as getSearchJobsQueueClient } from "../adapters/searchJobsQueue/client";
import { makeGetActiveKeywords } from "../adapters/keywordStore/getActiveKeywords";
import { socialMedias } from "../domain/models/socialMedia";
import { getConfig } from "../lib/config";
import _ from "lodash";
import { KeywordData } from "../domain/models/keyword";
import { makeQueueSearchJobs } from "../adapters/searchJobsQueue/queueSearchJobs";
import { getLogger } from "../lib/logger";
import { defaultMiddlewareStack } from "./middlewares/common";
import { eitherListToDefaultOk } from "src/domain/ports/shared";
import { fromEither } from "@diogovasconcelos/lib/iots";

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

      const searchJobs = activeKeywordsResult.right.map(keywordDataToSearchJob);
      return await queueSearchJobsFn(logger, socialMedia, searchJobs);
    })
  );

  fromEither(await eitherListToDefaultOk(results));
};

export const lambdaHandler = defaultMiddlewareStack(handler);

const keywordDataToSearchJob = (keywordData: KeywordData) => {
  return _.omit(keywordData, ["status"]);
};
