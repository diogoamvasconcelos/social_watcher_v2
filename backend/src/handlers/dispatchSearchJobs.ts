import { isLeft } from "fp-ts/lib/Either";
import { getClient as getKeywordStoreClient } from "../adapters/keywordStore/client";
import { getClient as getSearchJobsQueueClient } from "../adapters/searchJobsQueue/client";
import { makeGetActiveKeywords } from "../adapters/keywordStore/getActiveKeywords";
import { socialMedias } from "../domain/models/socialMedia";
import { getConfig } from "../lib/config";
import _ from "lodash";
import { KeywordData } from "../domain/models/keyword";
import { makeQueueSearchJobs } from "../adapters/searchJobsQueue/queueSearchJobs";
import { getLogger } from "../lib/logger";
import { defaultOutLayerMiddleware } from "./middlewares/common";

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
    config.searchJobQueueTemplateName
  );

  for (const socialMedia of socialMedias) {
    logger.info(`Handling ${socialMedia}...`);

    const activeKeywordsResult = await getActiveKeywordsFn(logger, socialMedia);
    if (isLeft(activeKeywordsResult)) {
      logger.error(`Failed to getActiveKeywords: ${activeKeywordsResult.left}`);
      return;
    }

    const searchJobs = activeKeywordsResult.right.map(keywordDataToSearchJob);
    const queueSearchJobsResult = await queueSearchJobsFn(
      logger,
      socialMedia,
      searchJobs
    );
    if (isLeft(queueSearchJobsResult)) {
      logger.error(`Failed to queueSearchJobs: ${queueSearchJobsResult.left}`);
      return;
    }

    logger.info(`Dispatched ${searchJobs.length} for ${socialMedia}`);
  }
};

export const lambdaHandler = defaultOutLayerMiddleware(handler);

const keywordDataToSearchJob = (keywordData: KeywordData) => {
  return _.omit(keywordData, ["status"]);
};
