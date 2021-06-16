import { SQSEvent } from "aws-lambda";
import { isLeft } from "fp-ts/lib/Either";
import { getClient as getDiscordNotifierClient } from "../../adapters/discordNotifier/client";
import { makeSendMessageToChannel } from "../../adapters/discordNotifier/sendMessageToChannel";
import { notifySearchResultToDiscord } from "../../domain/controllers/notifySearchResultToDiscord";
import { discordNotificationJobCodec } from "../../domain/models/notificationJob";
import { decode, fromEither } from "@diogovasconcelos/lib";
import { getLogger } from "../../lib/logger";
import { defaultMiddlewareStack } from "../middlewares/common";

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
