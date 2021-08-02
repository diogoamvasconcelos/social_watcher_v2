import { JsonEncodable } from "@diogovasconcelos/lib/models/jsonEncodable";
import SES from "aws-sdk/clients/ses";
import { isLeft, right } from "fp-ts/lib/Either";
import { SendEmailFn } from "../../domain/ports/emailReporter/sendEmail";
import { sendEmail } from "../../lib/ses";
import { Client } from "./client";

export const makeSendEmail = (client: Client): SendEmailFn => {
  return async (logger, { addresses, subject, body }) => {
    const params: SES.Types.SendEmailRequest = {
      Source: "notifier@thesocialwatcher.com",
      Destination: { ToAddresses: addresses },
      Message: {
        Subject: { Data: subject },
        Body: {
          Text: { Data: body.text },
          Html: { Data: body.html },
        },
      },
    };

    logger.info("Going to send email", {
      params: params as unknown as JsonEncodable,
    });

    const res = await sendEmail({ client, logger }, params);
    if (isLeft(res)) {
      return res;
    }

    return right("OK");
  };
};
