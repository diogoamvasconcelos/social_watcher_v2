import { Client as SSMClient, getParameter } from "../../lib/ssm";
import { Logger } from "../../lib/logger";
import { decode } from "@diogovasconcelos/lib/iots";
import { youtubeCredentialsCodec } from "../../lib/youtube/models";
import { isLeft } from "fp-ts/lib/Either";

export const getClientCredentials = async (
  ssmClient: SSMClient,
  logger: Logger
) => {
  const result = await getParameter(
    ssmClient,
    { Name: "youtube_keys", WithDecryption: true },
    (value: string) => {
      return decode(youtubeCredentialsCodec, JSON.parse(value));
    },
    logger
  );
  if (isLeft(result) || typeof result.right == "string") {
    throw new Error("Failed to retrieve Youtube Credentials");
  }

  return result.right;
};
