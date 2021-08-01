import { NotificationJob } from "../../models/notificationJob";
import { NotificationMedium } from "../../models/notificationMedium";
import { QueueJobsFn } from "../shared";

export type QueueNotificationJobsFn = QueueJobsFn<
  NotificationMedium,
  NotificationJob
>;
