import AWS from "aws-sdk";
import { TranslateTextRequest } from "aws-sdk/clients/translate";
import { Either, left, right } from "fp-ts/lib/Either";
import { Logger } from "./logger";

export const getClient = () => {
  return new AWS.Translate();
};
export type Client = ReturnType<typeof getClient>;

export const translateText = async (
  client: Client,
  request: TranslateTextRequest,
  logger: Logger
): Promise<Either<"ERROR", string>> => {
  try {
    const result = await client.translateText(request).promise();
    return right(result.TranslatedText);
  } catch (error) {
    logger.error("translateText failed", { error });
    return left("ERROR");
  }
};
