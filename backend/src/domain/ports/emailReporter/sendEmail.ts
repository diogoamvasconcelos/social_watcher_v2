import { EmailReportConfig } from "@src/domain/models/reportJob";
import { Logger } from "@src/lib/logger";
import { PickRequired } from "@src/lib/types";
import { DefaultOkReturn } from "@src/domain/ports/shared";

export type SendEmailFn = (
  logger: Logger,
  emailData: {
    addresses: PickRequired<EmailReportConfig, "addresses">;
    subject: string;
    body: {
      html: string;
    };
  }
) => DefaultOkReturn;
