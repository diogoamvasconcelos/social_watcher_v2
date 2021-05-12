import { SQSEvent } from "aws-lambda";
import { isLeft } from "fp-ts/lib/Either";
import { makePutSearchResults } from "../adapters/searchResultsStore/putSearchResults";
import { makeSearchTwitter } from "../adapters/twitterSearcher/searchTwitter";
import { getConfig } from "../lib/config";
import { decode } from "../lib/iots";
import {
  getClient as getTwitterClient,
  getClientCredentials as getTwitterCredentials,
} from "../adapters/twitterSearcher/client";
import { getClient as getSsmClient } from "../lib/ssm";
import { getClient as getSearchResultStoreClient } from "../adapters/searchResultsStore/client";
import { searchJobCodec } from "../domain/models/searchJob";
import { translateTwitterSearchResults } from "../domain/controllers/translateTwitterSearchResults";
import { getClient as getTranslateClient } from "../lib/translate";
import { makeTranslateToEnglish } from "../adapters/translater/translateToEnglish";
import { getLogger } from "../lib/logger";
import { defaultMiddlewareStack } from "./middlewares/common";

const config = getConfig();
const logger = getLogger();

const handler = async (event: SQSEvent) => {
  const twitterCredentials = await getTwitterCredentials(
    getSsmClient(),
    logger
  );
  const twitterClient = getTwitterClient(twitterCredentials);
  const searchTwitterFn = makeSearchTwitter(twitterClient);
  const searchResultStoreClient = getSearchResultStoreClient();
  const putSearchResultFn = makePutSearchResults(
    searchResultStoreClient,
    config.searchResultsTableName
  );
  const translateClient = getTranslateClient();
  const translateToEnglishFn = makeTranslateToEnglish(translateClient);

  await Promise.all(
    event.Records.map(async (record) => {
      const decodeResult = decode(searchJobCodec, JSON.parse(record.body));
      if (isLeft(decodeResult)) {
        throw new Error("Failed to decode search job");
      }

      const searchResults = await searchTwitterFn(
        logger,
        decodeResult.right.keyword
      );
      if (isLeft(searchResults)) {
        throw new Error("Failed to search Twitter");
      }
      logger.debug(
        `Found ${searchResults.right.length} twits for: ${decodeResult.right.keyword}`
      );

      const twitterSearchResults = await translateTwitterSearchResults(
        { translateToEnglishFn, logger },
        searchResults.right
      );

      const putResult = await putSearchResultFn(logger, twitterSearchResults);
      if (isLeft(putResult)) {
        throw new Error("Failed to put results");
      }
    })
  );
};

export const lambdaHandler = defaultMiddlewareStack(handler);
