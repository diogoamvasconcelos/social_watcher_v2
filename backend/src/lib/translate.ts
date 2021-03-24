import AWS from "aws-sdk";
import { TranslateTextRequest } from "aws-sdk/clients/translate";
import { Either, left, right } from "fp-ts/lib/Either";

export const getClient = () => {
  return new AWS.Translate();
};
export type Client = ReturnType<typeof getClient>;

export const translateText = async (
  client: Client,
  request: TranslateTextRequest
): Promise<Either<"ERROR", string>> => {
  try {
    const result = await client.translateText(request).promise();
    return right(result.TranslatedText);
  } catch (error) {
    console.error("translateText error:\n" + (error.message as string));
    return left("ERROR");
  }
};
