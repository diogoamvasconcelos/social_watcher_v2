import { SQSEvent } from "aws-lambda";
import {
  SearchResult,
  searchResultCodec,
} from "../../domain/models/searchResult";
import { decode, fromEither } from "../../lib/iots";
import { getLogger } from "../../lib/logger";
import { defaultMiddlewareStack } from "../middlewares/common";

//const config = getConfig();
const logger = getLogger();

const handler = async (event: SQSEvent) => {
  const searchResults: SearchResult[] = event.Records.map((record) => {
    return fromEither(decode(searchResultCodec, JSON.parse(record.body)));
  });

  logger.info("got searchResults", { searchResults });
};
export const lambdaHandler = defaultMiddlewareStack(handler);
