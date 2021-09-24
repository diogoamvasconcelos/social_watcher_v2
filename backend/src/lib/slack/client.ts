import { Either, left, right } from "fp-ts/lib/Either";
import { Logger } from "@src/lib/logger";
import { SlackCredentials } from "./models";
import {
  WebClient,
  ChatPostMessageArguments,
  ChatPostMessageResponse,
} from "@slack/web-api";

export const getClient = ({ token }: SlackCredentials) => {
  return new WebClient(token, {
    retryConfig: {
      // more info:
      // - https://slack.dev/node-slack-sdk/web-api
      // - https://github.com/tim-kos/node-retry#retryoperationoptions
      retries: 1,
      factor: 1,
    },
  });
};
export type Client = ReturnType<typeof getClient>;

export type SlackDependencies = {
  client: Client;
  logger: Logger;
};

export const postMessage = async (
  { logger, client }: SlackDependencies,
  args: ChatPostMessageArguments
): Promise<Either<"ERROR", ChatPostMessageResponse>> => {
  try {
    const result = await client.chat.postMessage(args);
    if (!result.ok || result.error) {
      logger.error("slack:postMessage has errors", { result });
      return left("ERROR");
    }
    return right(result);
  } catch (error) {
    logger.error("slack:postMessage failed", { error });
    return left("ERROR");
  }
};
