import { NotificationMedium } from "../../domain/models/notificationMedium";
import { QueueNotificationJobsFn } from "../../domain/ports/notificationJobsQueue/queueNotificationJobs";
import { makeQueueJobs } from "../queueShared";
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
