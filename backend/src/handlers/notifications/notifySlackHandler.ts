import { decode, fromEither } from "@diogovasconcelos/lib/iots";
import { SQSEvent } from "aws-lambda/trigger/sqs";
import { getClient as getSlackNotifierClient } from "@src/adapters/slackNotifier/client";
import { makeSendMessageToChannel } from "@src/adapters/slackNotifier/sendMessageToChannel";
import { notifySearchResultToSlack } from "@src/domain/controllers/notifySearchResultToSlack";
import { slackNotificationJobCodec } from "@src/domain/models/notificationJob";
import { getLogger } from "@src/lib/logger";
import { defaultMiddlewareStack } from "@src/handlers/middlewares/common";

const logger = getLogger();

const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const slackNotificationJob = fromEither(
      decode(slackNotificationJobCodec, JSON.parse(record.body))
    );

    if (slackNotificationJob.config.enabledStatus !== "ENABLED") {
      logger.info("Skipping as Slack notification is not enabled");
      return;
    }

    const slackNotifierClient = getSlackNotifierClient(
      slackNotificationJob.config.bot.credentials
    );

    fromEither(
      await notifySearchResultToSlack(
        {
          logger,
          sendMessageToChannel: makeSendMessageToChannel(slackNotifierClient),
        },
        slackNotificationJob.config.channel,
        slackNotificationJob.searchResult
      )
    );
  }
};
export const lambdaHandler = defaultMiddlewareStack(handler);
