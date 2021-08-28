import { decode, fromEither } from "@diogovasconcelos/lib/iots";
import { SQSEvent } from "aws-lambda/trigger/sqs";
import { isLeft } from "fp-ts/lib/Either";
import { getClient as getDiscordNotifierClient } from "@src/adapters/discordNotifier/client";
import { makeSendMessageToChannel } from "@src/adapters/discordNotifier/sendMessageToChannel";
import { notifySearchResultToDiscord } from "@src/domain/controllers/notifySearchResultToDiscord";
import { discordNotificationJobCodec } from "@src/domain/models/notificationJob";
import { getLogger } from "@src/lib/logger";
import { defaultMiddlewareStack } from "@src/handlers/middlewares/common";

const logger = getLogger();

const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const discordNotificationJob = fromEither(
      decode(discordNotificationJobCodec, JSON.parse(record.body))
    );

    if (discordNotificationJob.config.enabledStatus !== "ENABLED") {
      logger.info("Skipping as Discord notification is not enabled");
      return;
    }

    const discordNotifierClientEither = await getDiscordNotifierClient(
      logger,
      discordNotificationJob.config.bot.credentials
    );
    if (isLeft(discordNotifierClientEither)) {
      logger.error("Failed to login on the Discord Client. Probably bad token");
      throw new Error("Failed to login to Discord Client");
    }

    fromEither(
      await notifySearchResultToDiscord(
        {
          logger,
          sendMessageToChannel: makeSendMessageToChannel(
            discordNotifierClientEither.right
          ),
        },
        discordNotificationJob.config.channel,
        discordNotificationJob.searchResult
      )
    );
  }
};
export const lambdaHandler = defaultMiddlewareStack(handler);
