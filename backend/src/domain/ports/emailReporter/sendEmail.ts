import { EmailReportConfig } from "../../../domain/models/reportJob";
import { Logger } from "../../../lib/logger";
import { PickRequired } from "../../../lib/types";
import { DefaultOkReturn } from "../shared";

export type SendEmailFn = (
  logger: Logger,
  emailData: {
    addresses: PickRequired<EmailReportConfig, "addresses">;
    subject: string;
    body: {
      text: string;
      html: string;
    };
  }
) => DefaultOkReturn;
