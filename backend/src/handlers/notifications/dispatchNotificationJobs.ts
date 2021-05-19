import { SQSEvent } from "aws-lambda";
import {
  SearchResult,
  searchResultCodec,
} from "../../domain/models/searchResult";
import { decode, fromEither } from "@shared/lib/src/iots";
import { getLogger, Logger } from "../../lib/logger";
import { defaultMiddlewareStack } from "../middlewares/common";
import { makeGetSearchObjectsForKeyword } from "../../adapters/userStore/getSearchObjectsForKeyword";
import { getClient as getUserStoreClient } from "../../adapters/userStore/client";
import { getConfig } from "../../lib/config";
import {
  NotificationMedium,
  notificationMediums,
} from "../../domain/models/notificationMedium";
import { SearchObject } from "../../domain/models/userItem";
import { isLeft, right } from "fp-ts/lib/Either";
import {
  DefaultOkReturn,
  eitherListToDefaultOk,
} from "../../domain/ports/shared";
import { makeQueueNotificationJobs } from "../../adapters/notificationJobsQueue/queueNotificationJobs";
import { getClient as getNotificationJobsQueueClient } from "../../adapters/notificationJobsQueue/client";
import { QueueNotificationJobsFn } from "../../domain/ports/notificationJobsQueue/queueNotificationJobs";
import { DiscordNotificatonJob } from "../../domain/models/notificationJob";

const config = getConfig();
const logger = getLogger();

// TODO: make this lambda generic. No need for one lambda per medium as they all do very similar things
const handler = async (event: SQSEvent) => {
  const userStoreClient = getUserStoreClient();
  const searchJobsQueueClient = getNotificationJobsQueueClient();
  const getSearchObjectsForKeywordFn = makeGetSearchObjectsForKeyword(
    userStoreClient,
    config.usersTableName
  );

  const dispatchJobsDeps: DispatchJobsDeps = {
    logger,
    queueNotificationJobsFn: makeQueueNotificationJobs(
      searchJobsQueueClient,
      config.notificationJosbQueueTemplateName
    ),
  };

  const searchResults: SearchResult[] = event.Records.map((record) => {
    return fromEither(decode(searchResultCodec, JSON.parse(record.body)));
  });

  const results = await Promise.all(
    searchResults.map(async (searchResult) => {
      const searchObjectsEither = await getSearchObjectsForKeywordFn(
        logger,
        searchResult.keyword
      );
      if (isLeft(searchObjectsEither)) {
        return searchObjectsEither;
      }
      const searchObjects = searchObjectsEither.right;

      const innerResults = await Promise.all(
        notificationMediums.map(async (medium) => {
          return dispatchNotificationJobs(
            dispatchJobsDeps,
            medium,
            searchResult,
            searchObjects
          );
        })
      );

      return eitherListToDefaultOk(innerResults);
    })
  );

  return eitherListToDefaultOk(results);
};
export const lambdaHandler = defaultMiddlewareStack(handler);

type DispatchJobsDeps = {
  logger: Logger;
  queueNotificationJobsFn: QueueNotificationJobsFn;
};

type DispatchJobs = (
  deps: DispatchJobsDeps,
  notificationMedium: NotificationMedium,
  searchResult: SearchResult,
  searchObjects: SearchObject[]
) => DefaultOkReturn;

const dispatchNotificationJobs: DispatchJobs = async (
  { queueNotificationJobsFn },
  notificationMedium,
  searchResult,
  searchObjects
): DefaultOkReturn => {
  const jobs: DiscordNotificatonJob[] = [];

  for (const searchObject of searchObjects) {
    const config = getConfigForNotificationMedium(
      searchObject,
      notificationMedium
    );
    if (!config?.enabled) {
      continue;
    }

    jobs.push({
      searchResult,
      notificationMedium,
      config,
    });
  }

  if (jobs.length == 0) {
    return right("OK");
  }

  return await queueNotificationJobsFn(logger, notificationMedium, jobs);
};

const getConfigForNotificationMedium = (
  searchObject: SearchObject,
  notificationMedium: NotificationMedium
) => {
  switch (notificationMedium) {
    case "discord":
      return searchObject.discordNotification;
  }
};
