import { Logger } from "../../../lib/logger";
import { NotificationJob } from "../../models/notificationJob";
import { NotificationMedium } from "../../models/notificationMedium";
import { DefaultOkReturn } from "../shared";

export type QueueNotificationJobsFn = (
  logger: Logger,
  notificatonMedium: NotificationMedium,
  searchJobs: NotificationJob[]
) => DefaultOkReturn;
