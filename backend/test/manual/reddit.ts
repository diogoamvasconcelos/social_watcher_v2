import { getClient, searchAll } from "../../src/lib/reddit/client";
import { getClient as getSSMClient, getParameter } from "../../src/lib/ssm";
import { getLogger } from "../../src/lib/logger";
import { decode, fromEither } from "@diogovasconcelos/lib";
import { redditCredentialsCodec } from "../../src/lib/reddit/models";

const logger = getLogger();

const searchReddit = async () => {
  const credentials = fromEither(
    await getParameter(
      getSSMClient(),
      { Name: "reddit_app_keys", WithDecryption: true },
      (value: string) => {
        return decode(redditCredentialsCodec, JSON.parse(value));
      },
      logger
    )
  );

  if (credentials === "NOT_FOUND") {
    logger.error("Failed to get reddit credentials");
    return;
  }

  const client = getClient(credentials);
  const result = fromEither(await searchAll({ client, logger }, "pureref"));
  console.log(result.data.children);
};

export const main = async () => {
  await searchReddit();
};

void main();
