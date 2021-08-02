import { fromEither } from "@diogovasconcelos/lib/iots";
import SES from "aws-sdk/clients/ses";
import { getLogger } from "../../src/lib/logger";
import { getClient, sendEmail } from "../../src/lib/ses";

const logger = getLogger();

const sendTestEmail = async () => {
  const client = getClient();

  const params: SES.Types.SendEmailRequest = {
    Source: "notifier@thesocialwatcher.com",
    Destination: { ToAddresses: ["main@thesocialwatcher.com"] },
    Message: {
      Subject: { Data: "Social Watcher test" },
      Body: {
        Text: { Data: "Nice" },
        Html: { Data: "<h1>Nice</h1><p>very nice</p>" },
      },
    },
  };

  const res = fromEither(await sendEmail({ client, logger }, params));
  console.log(res);
};

export const main = async () => {
  await sendTestEmail();
};

void main();
