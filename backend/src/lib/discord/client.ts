import Discord from "discord.js";
import { Either, left, right } from "fp-ts/lib/Either";
import { Logger } from "@src/lib/logger";
import { DiscordCredentials } from "./models";

export const getClient = async (
  logger: Logger,
  credentials: DiscordCredentials
): Promise<Either<"ERROR", Discord.Client>> => {
  try {
    const client = new Discord.Client();
    const res = await client.login(credentials.token);
    logger.debug("discord logged in", { res });
    return right(client);
  } catch (error) {
    logger.error("discord:getClient failed", { error });
    return left("ERROR");
  }
};
export type Client = Discord.Client;

export type DiscordDependencies = {
  client: Client;
  logger: Logger;
};

export const messageToChannel = async (
  { logger, client }: DiscordDependencies,
  channelId: string,
  message: string
): Promise<Either<"ERROR", Discord.Message>> => {
  try {
    const channel = client.channels.cache.get(channelId);

    const isTextChannelTypeGuard = (
      channel: Discord.Channel | undefined
    ): channel is Discord.TextChannel => channel?.type === "text";
    if (!isTextChannelTypeGuard(channel)) {
      logger.error("discord:message failed: channel is invalid", { channelId });
      return left("ERROR");
    }

    const textChannel: Discord.TextChannel = channel;
    const res = await textChannel.send(message);
    return right(res);
  } catch (error) {
    logger.error("discord:message failed", { error });
    return left("ERROR");
  }
};
