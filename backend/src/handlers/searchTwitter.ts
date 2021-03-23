import { SQSEvent, SQSHandler } from "aws-lambda";
import { isLeft } from "fp-ts/lib/Either";
import { makeSearchTwitter } from "../adapters/twitterSearcher/searchTwitter";
import { decode } from "../lib/iots";
import { getClient as getSsmClient, getParameter } from "../lib/ssm";
import {
  getClient as getTwitterClient,
  twitterCredentialsCodec,
} from "../lib/twitter";

const handler = async (event: SQSEvent) => {
  console.log(event);
  console.log(`Recieved ${event.Records.length} twitter search jobs`);

  const twitterCredentials = await getTwitterCredentials(getSsmClient());
  const twitterClient = getTwitterClient(twitterCredentials);
  const searchTwitterFn = makeSearchTwitter(twitterClient);

  const searchResult = await searchTwitterFn("Tesla");
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
