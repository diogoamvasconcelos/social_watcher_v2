import { DynamoDBStreamEvent } from "aws-lambda";
import { Converter } from "aws-sdk/clients/dynamodb";
import { makeQueueSearchResults } from "@src/adapters/searchResultsQueue/queueSearchJobs";
import { unknownToSearchResult } from "@src/adapters/searchResultsStore/client";
import { eitherListToDefaultOk } from "@src/domain/ports/shared";
import { getConfig } from "@src/lib/config";
import { getLogger } from "@src/lib/logger";
import { defaultMiddlewareStack } from "@src/handlers/middlewares/common";
import { getClient as getSearchResultsQueueClient } from "@src/adapters/searchResultsQueue/client";
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
    // TODO: Handle delete
    const image = Converter.unmarshall(record.dynamodb?.NewImage ?? {});
    return fromEither(unknownToSearchResult(image));
  });

  const queueResults = await Promise.all(
    queueFns.map(async (queueFn) => await queueFn(logger, searchResults))
  );

  fromEither(await eitherListToDefaultOk(queueResults));
};

export const lambdaHandler = defaultMiddlewareStack(handler);
