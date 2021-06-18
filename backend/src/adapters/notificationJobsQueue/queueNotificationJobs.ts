import { isLeft, left, right } from "fp-ts/lib/Either";
import { QueueNotificationJobsFn } from "../../domain/ports/notificationJobsQueue/queueNotificationJobs";
import { getQueueUrlFromName, sendMessages } from "../../lib/sqs";
import { Client } from "./client";

export const makeQueueNotificationJobs = (
  client: Client,
  notificationJobQueueTemplateName: string
): QueueNotificationJobsFn => {
  return async (logger, notificationMedium, notificationJobs) => {
    if (notificationJobs.length == 0) {
      logger.info(
        `Skipping queueing notificationJobs for ${notificationMedium}: empty list.`
      );
      return right("OK");
    }

    const queueName = notificationJobQueueTemplateName.replace(
      "{notificationMedium}",
      notificationMedium
    );
    const toUrl = await getQueueUrlFromName(client, queueName, logger);
    if (isLeft(toUrl)) {
      logger.error("getQueueUrlFromName failed.", { error: toUrl.left });
      return left("ERROR");
    }

    const result = await sendMessages(
      client,
      toUrl.right,
      notificationJobs.map((job) => ({
        Body: JSON.stringify(job),
      })),
      logger
    );
    if (isLeft(result)) {
      logger.error("sendMessages failed.", { error: result.left });
      return left("ERROR");
    }

    return right("OK");
  };
};
