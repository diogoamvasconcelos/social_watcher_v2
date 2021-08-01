import { ReportMedium } from "../../domain/models/reportMedium";
import { QueueReportJobsFn } from "../../domain/ports/reportJobsQueue/queueReportJobs";
import { makeQueueJobs } from "../queueShared";
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
