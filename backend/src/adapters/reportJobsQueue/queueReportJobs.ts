import { ReportMedium } from "@src/domain/models/reportMedium";
import { QueueReportJobsFn } from "@src/domain/ports/reportJobsQueue/queueReportJobs";
import { makeQueueJobs } from "@src/adapters/queueShared";
import { Client } from "./client";

export const makeQueueReportJobs = (
  client: Client,
  reportJobQueueTemplateName: string
): QueueReportJobsFn => {
  return makeQueueJobs(
    client,
    (reportMedium: ReportMedium) =>
      reportJobQueueTemplateName.replace("{reportMedium}", reportMedium),
    "report"
  );
};
