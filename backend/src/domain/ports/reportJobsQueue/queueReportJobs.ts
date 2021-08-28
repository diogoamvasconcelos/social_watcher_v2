import { ReportJob } from "@src/domain/models/reportJob";
import { ReportMedium } from "@src/domain/models/reportMedium";
import { QueueJobsFn } from "@src/domain/ports/shared";

export type QueueReportJobsFn = QueueJobsFn<ReportMedium, ReportJob>;
