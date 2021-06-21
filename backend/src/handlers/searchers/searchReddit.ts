import { SQSEvent } from "aws-lambda";
import { isLeft } from "fp-ts/lib/Either";
import { makePutSearchResults } from "../../adapters/searchResultsStore/putSearchResults";
import { getConfig } from "../../lib/config";
import { decode } from "@diogovasconcelos/lib";
import {
  getClient as getRedditClient,
  getClientCredentials as getRedditCredentials,
} from "../../adapters/redditSearcher/client";
import { getClient as getSsmClient } from "../../lib/ssm";
import { getClient as getSearchResultStoreClient } from "../../adapters/searchResultsStore/client";
import { searchJobCodec } from "../../domain/models/searchJob";
import { getClient as getTranslateClient } from "../../lib/translate";
import { makeTranslateToEnglish } from "../../adapters/translater/translateToEnglish";
import { getLogger } from "../../lib/logger";
import { defaultMiddlewareStack } from "../middlewares/common";
import { translateSearchResults } from "../../domain/controllers/translateSearchResults";
import { RedditSearchResult } from "../../domain/models/searchResult";
import { makeSearchReddit } from "../../adapters/redditSearcher/searchReddit";

const config = getConfig();
const logger = getLogger();

const handler = async (event: SQSEvent) => {
  const redditCredentials = await getRedditCredentials(getSsmClient(), logger);
  const redditClient = getRedditClient(redditCredentials);
  const searchRedditFn = makeSearchReddit(redditClient);
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

      const searchResults = await searchRedditFn(
        logger,
        decodeResult.right.keyword
      );
      if (isLeft(searchResults)) {
        throw new Error("Failed to search Reddit");
      }
      logger.debug(
        `Found ${searchResults.right.length} reddit posts for: ${decodeResult.right.keyword}`
      );

      const redditSearchResults: RedditSearchResult[] =
        await translateSearchResults(
          { translateToEnglishFn, logger },
          searchResults.right
        );

      const putResult = await putSearchResultFn(logger, redditSearchResults);
      if (isLeft(putResult)) {
        throw new Error("Failed to put results");
      }
    })
  );
};

export const lambdaHandler = defaultMiddlewareStack(handler);
