import { DynamoDBStreamEvent } from "aws-lambda";
import { Converter } from "aws-sdk/clients/dynamodb";
import { makeQueueSearchResults } from "../../adapters/searchResultsQueue/queueSearchJobs";
import { unknownToSearchResult } from "../../adapters/searchResultsStore/client";
import { eitherListToDefaultOk } from "../../domain/ports/shared";
import { getConfig } from "../../lib/config";
import { fromEither } from "../../lib/iots";
import { getLogger } from "../../lib/logger";
import { defaultMiddlewareStack } from "../middlewares/common";
import { getClient as getSearchResultsQueueClient } from "../../adapters/searchResultsQueue/client";
import { notificationMediums } from "../../domain/models/notificationMedium";
import { getQueueUrlFromName } from "../../lib/sqs";

const config = getConfig();
const logger = getLogger();

export const handler = async (event: DynamoDBStreamEvent) => {
  const searchResultsQueueClient = getSearchResultsQueueClient();

  const notificationMediumQueues = await Promise.all(
    notificationMediums.map(async (notificationMedium) => {
      const queueName = config.searchResultsToNotificationMediumQueueTemplateName.replace(
        "{notificationMedium}",
        notificationMedium
      );
      return fromEither(
        await getQueueUrlFromName(searchResultsQueueClient, queueName, logger)
      );
    })
  );

  const queueFns = [
    config.syncSearchResultsToEsQueueUrl,
    ...notificationMediumQueues,
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
