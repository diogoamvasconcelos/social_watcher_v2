import { ScheduledHandler } from "aws-lambda";
import { isLeft } from "fp-ts/lib/Either";
import { getClient as getKeywordStoreClient } from "../adapters/keywordStore/client";
import { makeGetActiveKeywords } from "../adapters/keywordStore/getActiveKeywords";
import { socialMedias } from "../core/models/socialMedia";
import { getConfig } from "../lib/config";

/*
TODO:
*/

const config = getConfig();

const handler = async () => {
  const keywordStoreClient = getKeywordStoreClient();
  const getActiveKeywordsFn = makeGetActiveKeywords(
    keywordStoreClient,
    config.keywordsTableName
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

    console.log(activeKeywordsResult.right);
    /*
    const queueSearchJobsResult = queueSearchJobs(
      activeKeywords.map((keyword) => keyword)
    );
    */
  }
};

export const lambdaHandler: ScheduledHandler = async () => {
  await handler();
};
