import { decode, fromEither } from "@diogovasconcelos/lib/iots";
import { SQSEvent } from "aws-lambda/trigger/sqs";
import { makeSendEmail } from "@src/adapters/emailReporter/sendEmail";
import { emailReportJobCodec } from "@src/domain/models/reportJob";
import { getLogger } from "@src/lib/logger";
import { getClient as getEmailReporterClient } from "@src/adapters/emailReporter/client";
import { defaultMiddlewareStack } from "@src/handlers/middlewares/common";
import { capitalizeWord } from "@src/lib/text";
import { formatEmailReport } from "@src/domain/controllers/formatEmailReport";

const logger = getLogger();

export const handler = async (event: SQSEvent) => {
  const emailReporterClient = getEmailReporterClient();
  const sendEmailFn = makeSendEmail(emailReporterClient);

  for (const record of event.Records) {
    const emailReportJob = fromEither(
      decode(emailReportJobCodec, JSON.parse(record.body))
    );

    if (
      emailReportJob.config.status === "DISABLED" ||
      !emailReportJob.config.addresses
    ) {
      logger.info("Skipping as email report is not enabled");
      return;
    }

    fromEither(
      await sendEmailFn(logger, {
        addresses: emailReportJob.config.addresses,
        subject: `${capitalizeWord(
          emailReportJob.searchFrequency
        )} report for keyword: ${emailReportJob.keyword}`,
        body: {
          html: await formatEmailReport(emailReportJob),
        },
      })
    );
  }
};
export const lambdaHandler = defaultMiddlewareStack(handler);
