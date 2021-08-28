import { NotificationJob } from "@src/domain/models/notificationJob";
import { NotificationMedium } from "@src/domain/models/notificationMedium";
import { QueueJobsFn } from "@src/domain/ports/shared";

export type QueueNotificationJobsFn = QueueJobsFn<
  NotificationMedium,
  NotificationJob
>;
