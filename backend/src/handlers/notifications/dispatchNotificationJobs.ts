import { SQSEvent } from "aws-lambda";
import {
  SearchResult,
  searchResultCodec,
} from "../../domain/models/searchResult";
import { getLogger, Logger } from "../../lib/logger";
import { defaultMiddlewareStack } from "../middlewares/common";
import { makeGetSearchObjectsForKeyword } from "../../adapters/userStore/getSearchObjectsForKeyword";
import { getClient as getUserStoreClient } from "../../adapters/userStore/client";
import { getConfig } from "../../lib/config";
import {
  NotificationMedium,
  notificationMediums,
} from "../../domain/models/notificationMedium";
import { SearchObjectDomain } from "../../domain/models/userItem";
import { isLeft, right } from "fp-ts/lib/Either";
import {
  DefaultOkReturn,
  eitherListToDefaultOk,
} from "../../domain/ports/shared";
import { makeQueueNotificationJobs } from "../../adapters/notificationJobsQueue/queueNotificationJobs";
import { getClient as getNotificationJobsQueueClient } from "../../adapters/notificationJobsQueue/client";
import { QueueNotificationJobsFn } from "../../domain/ports/notificationJobsQueue/queueNotificationJobs";
import { NotificationJob } from "../../domain/models/notificationJob";
import { decode, fromEither } from "@diogovasconcelos/lib/iots";
import { throwUnexpectedCase } from "../..//lib/runtime";

const config = getConfig();
const logger = getLogger();

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
  searchObjects: SearchObjectDomain[]
) => DefaultOkReturn;

const dispatchNotificationJobs: DispatchJobs = async (
  { queueNotificationJobsFn },
  notificationMedium,
  searchResult,
  searchObjects
): DefaultOkReturn => {
  const jobs: NotificationJob[] = [];

  for (const searchObject of searchObjects) {
    let job: NotificationJob | undefined = undefined;
    switch (notificationMedium) {
      // need to add the job in single object for types to be correct
      case "discord":
        job = {
          searchResult,
          notificationMedium,
          config: searchObject.notificationData.discordNotification,
        };
        break;
      case "slack":
        job = {
          searchResult,
          notificationMedium,
          config: searchObject.notificationData.slackNotification,
        };
        break;
      default:
        return throwUnexpectedCase(
          notificationMedium,
          "dispatchNotificationJobs"
        );
    }

    if (job.config.enabledStatus !== "ENABLED") {
      continue;
    }

    jobs.push(job);
  }

  if (jobs.length == 0) {
    return right("OK");
  }

  return await queueNotificationJobsFn(logger, notificationMedium, jobs);
};
