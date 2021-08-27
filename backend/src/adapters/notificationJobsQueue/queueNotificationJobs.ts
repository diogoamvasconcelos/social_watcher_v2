import { NotificationMedium } from "@src/domain/models/notificationMedium";
import { QueueNotificationJobsFn } from "@src/domain/ports/notificationJobsQueue/queueNotificationJobs";
import { makeQueueJobs } from "@src/adapters/queueShared";
import { Client } from "./client";

export const makeQueueNotificationJobs = (
  client: Client,
  notificationJobQueueTemplateName: string
): QueueNotificationJobsFn => {
  return makeQueueJobs(
    client,
    (notificationMedium: NotificationMedium) =>
      notificationJobQueueTemplateName.replace(
        "{notificationMedium}",
        notificationMedium
      ),
    "report"
  );
};
