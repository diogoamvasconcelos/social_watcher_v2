import { isLeft } from "fp-ts/lib/Either";
import { getClient, messageToChannel } from "@src/lib/discord/client";
import { getLogger } from "@src/lib/logger";
import { JsonEncodable } from "@diogovasconcelos/lib/models/jsonEncodable";

const logger = getLogger();

const sendMessage = async () => {
  const discordClientEither = await getClient(logger, {
    token: "*****",
  });
  if (isLeft(discordClientEither)) {
    logger.error("Discord client failed", { err: discordClientEither.left });
    return;
  }
  const client = discordClientEither.right;

  let message = "> New Diogo Twitter message (author followers: 1)";
  message += "\n";
  message += "https://twitter.com/x/status/1393107464522928132";

  const res = await messageToChannel(
    { logger, client },
    "805202695639400499",
    message
  );
  if (isLeft(res)) {
    logger.error("Discord client message failed", { err: res.left });
    return;
  }

  logger.info("success", { res: res.right as unknown as JsonEncodable });
};

export const main = async () => {
  await sendMessage();
};

//void main();
