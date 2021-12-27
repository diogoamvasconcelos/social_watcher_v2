import Translate, { TranslateTextRequest } from "aws-sdk/clients/translate";
import { Either, left, right } from "fp-ts/lib/Either";
import { Logger } from "./logger";

export const getClient = () => {
  return new Translate();
};
export type Client = ReturnType<typeof getClient>;

export const translateText = async (
  client: Client,
  request: TranslateTextRequest,
  logger: Logger
): Promise<Either<"ERROR", { text: string; lang: string }>> => {
  try {
    const result = await client.translateText(request).promise();
    return right({
      text: result.TranslatedText,
      lang: result.SourceLanguageCode,
    });
  } catch (error) {
    logger.error("translateText failed", { error, request });
    return left("ERROR");
  }
};
