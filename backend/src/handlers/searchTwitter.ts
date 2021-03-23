import { SQSEvent, SQSHandler } from "aws-lambda";
import { isLeft } from "fp-ts/lib/Either";
import { makePutSearchResults } from "../adapters/searchResultsStore/putSearchResults";
import { makeSearchTwitter } from "../adapters/twitterSearcher/searchTwitter";
import { getConfig } from "../lib/config";
import { decode } from "../lib/iots";
import { getClient as getSsmClient, getParameter } from "../lib/ssm";
import {
  getClient as getTwitterClient,
  twitterCredentialsCodec,
} from "../lib/twitter";
import { getClient as getSearchResultStoreClient } from "../adapters/searchResultsStore/client";
import { searchJobCodec } from "../domain/models/searchJobs";

const config = getConfig();

const handler = async (event: SQSEvent) => {
  console.log(`Recieved ${event.Records.length} twitter search jobs`);

  const twitterCredentials = await getTwitterCredentials(getSsmClient());
  const twitterClient = getTwitterClient(twitterCredentials);
  const searchTwitterFn = makeSearchTwitter(twitterClient);
  const searchResultStoreClient = getSearchResultStoreClient();
  const putSearchResultFn = makePutSearchResults(
    searchResultStoreClient,
    config.searchResultsTableName
  );

  await Promise.all(
    event.Records.map(async (record) => {
      const decodeResult = decode(searchJobCodec, JSON.parse(record.body));
      if (isLeft(decodeResult)) {
        throw new Error("Failed to decode search job");
      }

      const searchResults = await searchTwitterFn(decodeResult.right.keyword);
      if (isLeft(searchResults)) {
        throw new Error("Failed to search Twitter");
      }
      console.log(
        `Found ${searchResults.right.length} twits for: ${decodeResult.right.keyword}`
      );

      // TODO: Add translation

      const putResult = await putSearchResultFn(searchResults.right);
      if (isLeft(putResult)) {
        throw new Error("Failed to put results");
      }
    })
  );
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
