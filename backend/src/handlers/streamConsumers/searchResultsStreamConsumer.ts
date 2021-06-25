import { DynamoDBStreamEvent } from "aws-lambda";
import { Converter } from "aws-sdk/clients/dynamodb";
import { makeQueueSearchResults } from "../../adapters/searchResultsQueue/queueSearchJobs";
import { unknownToSearchResult } from "../../adapters/searchResultsStore/client";
import { eitherListToDefaultOk } from "../../domain/ports/shared";
import { getConfig } from "../../lib/config";
import { getLogger } from "../../lib/logger";
import { defaultMiddlewareStack } from "../middlewares/common";
import { getClient as getSearchResultsQueueClient } from "../../adapters/searchResultsQueue/client";
import { fromEither } from "@diogovasconcelos/lib/iots";

const config = getConfig();
const logger = getLogger();

export const handler = async (event: DynamoDBStreamEvent) => {
  const searchResultsQueueClient = getSearchResultsQueueClient();

  const queueFns = [
    config.syncSearchResultsToEsQueueUrl,
    config.searchResultsNotificationsQueueUrl,
  ].map((queueUrl) =>
    makeQueueSearchResults(searchResultsQueueClient, queueUrl)
  );

  const searchResults = event.Records.map((record) => {
    const image = Converter.unmarshall(record.dynamodb?.NewImage ?? {});
    return fromEither(unknownToSearchResult(image));
  });

  const queueResults = await Promise.all(
    queueFns.map(async (queueFn) => await queueFn(logger, searchResults))
  );

  fromEither(await eitherListToDefaultOk(queueResults));
};

export const lambdaHandler = defaultMiddlewareStack(handler);
