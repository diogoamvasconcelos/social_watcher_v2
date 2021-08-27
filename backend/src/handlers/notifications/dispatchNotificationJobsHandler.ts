import { SQSEvent } from "aws-lambda/trigger/sqs";
import {
  SearchResult,
  searchResultCodec,
} from "@src/domain/models/searchResult";
import { getLogger, Logger } from "@src/lib/logger";
import { defaultMiddlewareStack } from "@src/handlers/middlewares/common";
import { makeGetSearchObjectsForKeyword } from "@src/adapters/userStore/getSearchObjectsForKeyword";
import { getClient as getUserStoreClient } from "@src/adapters/userStore/client";
import { getConfig } from "@src/lib/config";
import {
  NotificationMedium,
  notificationMediums,
} from "@src/domain/models/notificationMedium";
import { SearchObjectDomain } from "@src/domain/models/userItem";
import { isLeft, right } from "fp-ts/lib/Either";
import {
  DefaultOkReturn,
  eitherListToDefaultOk,
} from "@src/domain/ports/shared";
import { makeQueueNotificationJobs } from "@src/adapters/notificationJobsQueue/queueNotificationJobs";
import { getClient as getNotificationJobsQueueClient } from "@src/adapters/notificationJobsQueue/client";
import { QueueNotificationJobsFn } from "@src/domain/ports/notificationJobsQueue/queueNotificationJobs";
import { NotificationJob } from "@src/domain/models/notificationJob";
import { decode, fromEither } from "@diogovasconcelos/lib/iots";

const config = getConfig();
const logger = getLogger();

export const handler = async (event: SQSEvent) => {
  const userStoreClient = getUserStoreClient();
  const notificationJobsQueueClient = getNotificationJobsQueueClient();
  const getSearchObjectsForKeywordFn = makeGetSearchObjectsForKeyword(
    userStoreClient,
    config.usersTableName
  );

  const dispatchJobsDeps: DispatchJobsDeps = {
    logger,
    queueNotificationJobsFn: makeQueueNotificationJobs(
      notificationJobsQueueClient,
      config.notificationJobsQueueTemplateName
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
    const job: NotificationJob = {
      searchResult,
      notificationMedium,
      config: searchObject.notificationData[notificationMedium],
    };

    if (job.config.enabledStatus !== "ENABLED") {
      continue;
    }
    if (!socialMediaAllowed(searchResult, searchObject)) {
      continue;
    }

    jobs.push(job);
  }

  if (jobs.length == 0) {
    return right("OK");
  }

  return await queueNotificationJobsFn(logger, notificationMedium, jobs);
};

const socialMediaAllowed = (
  searchResult: SearchResult,
  searchObject: SearchObjectDomain
): boolean => {
  if (
    searchObject.searchData[searchResult.socialMedia].enabledStatus !==
    "ENABLED"
  ) {
    return false;
  }

  switch (searchResult.socialMedia) {
    case "twitter":
      break;
    case "reddit": {
      if (
        searchResult.data.over_18 &&
        !searchObject.searchData[searchResult.socialMedia].over18
      ) {
        return false;
      }
      break;
    }
    case "hackernews":
      if (
        searchResult.data.fuzzyMatch &&
        !searchObject.searchData[searchResult.socialMedia].fuzzyMatch
      ) {
        return false;
      }
      break;
    case "instagram":
      break;
    case "youtube":
      break;
  }

  return true;
};
