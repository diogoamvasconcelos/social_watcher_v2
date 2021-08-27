import { isLeft, right } from "fp-ts/lib/Either";
import { SendMessageToChannelFn } from "@src/domain/ports/discordNotifier/sendMessageToChannel";
import { messageToChannel } from "@src/lib/discord/client";
import { Client } from "./client";

export const makeSendMessageToChannel = (
  client: Client
): SendMessageToChannelFn => {
  return async (logger, channel, message) => {
    const res = await messageToChannel({ logger, client }, channel, message);
    if (isLeft(res)) {
      return res;
    }

    return right("OK");
  };
};
