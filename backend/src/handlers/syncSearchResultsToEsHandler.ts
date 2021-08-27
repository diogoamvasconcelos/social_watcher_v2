import { SQSEvent } from "aws-lambda/trigger/sqs";
import { getConfig } from "@src/lib/config";
import { getClient as getSearchResultSearchEngineClient } from "@src/adapters/searchResultsSearchEngine/client";
import { getLogger } from "@src/lib/logger";
import { defaultMiddlewareStack } from "./middlewares/common";
import { makeIndexSearchResults } from "@src/adapters/searchResultsSearchEngine/indexSearchResults";
import {
  SearchResult,
  searchResultCodec,
} from "@src/domain/models/searchResult";
import { decode, fromEither } from "@diogovasconcelos/lib/iots";

const config = getConfig();
const logger = getLogger();

const handler = async (event: SQSEvent) => {
  const searchResultSearchEngineClient = getSearchResultSearchEngineClient(
    config.mainElasticSearchUrl
  );
  const indexSearchResultsFn = makeIndexSearchResults(
    searchResultSearchEngineClient
  );

  const searchResults: SearchResult[] = event.Records.map((record) => {
    return fromEither(decode(searchResultCodec, JSON.parse(record.body)));
  });

  fromEither(await indexSearchResultsFn(logger, searchResults));
};

export const lambdaHandler = defaultMiddlewareStack(handler);
