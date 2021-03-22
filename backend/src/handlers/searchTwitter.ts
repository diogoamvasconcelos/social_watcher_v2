import { SQSEvent, SQSHandler } from "aws-lambda";
import { isLeft } from "fp-ts/lib/Either";
import { decode } from "../lib/iots";
import { getClient as getSsmClient, getParameter } from "../lib/ssm";
import { twitterCredentialsCodec } from "../lib/twitter";

/* TODO
  limit search results (for crazy stuff like bitcoin, etc)
*/

const handler = async (event: SQSEvent) => {
  console.log(event);
  console.log(`Recieved ${event.Records.length} twitter search jobs`);

  const twitterCredentials = await getTwitterCredentials(getSsmClient());
};

export const lambdaHandler: SQSHandler = async (event: SQSEvent) => {
  await handler(event);
};

const getTwitterCredentials = async (ssmClient: AWS.SSM) => {
  const result = await getParameter(
    ssmClient,
    { Name: "twitter_bot_keys", WithDecryption: true },
    (value: string) => {
      return decode(twitterCredentialsCodec, JSON.parse(value));
    }
  );
  if (isLeft(result) || typeof result.right == "string") {
    throw new Error("Failed to retrieve Twitter Credentials");
  }

  return result.right;
};
