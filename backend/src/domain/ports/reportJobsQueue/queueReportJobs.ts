import { ReportJob } from "../../../domain/models/reportJob";
import { ReportMedium } from "../../../domain/models/reportMedium";
import { QueueJobsFn } from "../shared";

export type QueueReportJobsFn = QueueJobsFn<ReportMedium, ReportJob>;
