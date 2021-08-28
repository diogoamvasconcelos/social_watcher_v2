import { isLeft, right } from "fp-ts/lib/Either";
import { SendMessageToChannelFn } from "@src/domain/ports/slackNotifier/sendMessageToChannel";
import { postMessage } from "@src/lib/slack/client";
import { Client } from "./client";

export const makeSendMessageToChannel = (
  client: Client
): SendMessageToChannelFn => {
  return async (logger, channel, message) => {
    const res = await postMessage(
      { logger, client },
      { channel, text: message }
    );
    if (isLeft(res)) {
      return res;
    }

    return right("OK");
  };
};
