import { isLeft } from "fp-ts/lib/Either";
import { getClient, messageToChannel } from "../../src/lib/discord";
import { getLogger } from "../../src/lib/logger";
import { JsonEncodable } from "../../src/lib/models/jsonEncodable";

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

  const res = await messageToChannel(
    { logger, client },
    "805202695639400499",
    "test!!!"
  );
  if (isLeft(res)) {
    logger.error("Discord client message failed", { err: res.left });
    return;
  }

  logger.info("success", { res: (res.right as unknown) as JsonEncodable });
};

export const main = async () => {
  await sendMessage();
};

//void main();
