import { decode, fromEither } from "@diogovasconcelos/lib/iots";
import { SQSEvent } from "aws-lambda/trigger/sqs";
import { makeSendEmail } from "@src/adapters/emailReporter/sendEmail";
import { emailReportJobCodec } from "@src/domain/models/reportJob";
import { getLogger } from "@src/lib/logger";
import { getClient as getEmailReporterClient } from "@src/adapters/emailReporter/client";
import { defaultMiddlewareStack } from "@src/handlers/middlewares/common";
import { capitalizeWord } from "@src/lib/text";

const logger = getLogger();

const handler = async (event: SQSEvent) => {
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
      // TODO: improve this email formatting
      await sendEmailFn(logger, {
        addresses: emailReportJob.config.addresses,
        subject: `${capitalizeWord(
          emailReportJob.searchFrequency
        )} report for keyword: ${emailReportJob.keyword}`,
        body: {
          text: emailReportJob.searchResults
            .map((searchResult) => JSON.stringify(searchResult))
            .join("\n next result: \n"),
          html:
            "<h1> REPORT </h1>" +
            emailReportJob.searchResults
              .map((searchResult) => JSON.stringify(searchResult))
              .join("<p> next result: </p>"),
        },
      })
    );
  }
};
export const lambdaHandler = defaultMiddlewareStack(handler);
