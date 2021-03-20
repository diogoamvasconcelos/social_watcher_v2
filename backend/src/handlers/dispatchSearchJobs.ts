import { ScheduledHandler } from "aws-lambda";
import { isLeft } from "fp-ts/lib/Either";
import { getClient as getKeywordStoreClient } from "../adapters/keywordStore/client";
import { getClient as getSearchJobsQueueClient } from "../adapters/searchJobsQueue/client";
import { makeGetActiveKeywords } from "../adapters/keywordStore/getActiveKeywords";
import { socialMedias } from "../domain/models/socialMedia";
import { getConfig } from "../lib/config";
import _ from "lodash";
import { KeywordData } from "../domain/models/keyword";
import { makeQueueSearchJobs } from "../adapters/searchJobsQueue/queueSearchJobs";

/*
TODO:
*/

const config = getConfig();

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
    console.log(`Handling ${socialMedia}...`);

    const activeKeywordsResult = await getActiveKeywordsFn(socialMedia);
    if (isLeft(activeKeywordsResult)) {
      console.error(
        `Failed to getActiveKeywords: ${activeKeywordsResult.left}`
      );
      return;
    }

    const searchJobs = activeKeywordsResult.right.map(keywordDataToSearchJob);
    const queueSearchJobsResult = await queueSearchJobsFn(
      socialMedia,
      searchJobs
    );
    if (isLeft(queueSearchJobsResult)) {
      console.error(`Failed to queueSearchJobs) ${queueSearchJobsResult.left}`);
      return;
    }
  }
};

export const lambdaHandler: ScheduledHandler = async () => {
  await handler();
};

const keywordDataToSearchJob = (keywordData: KeywordData) => {
  return _.omit(keywordData, ["status"]);
};
