import { decode } from "@diogovasconcelos/lib/iots";
import { isLeft } from "fp-ts/lib/Either";
import {
  redditCredentialsCodec,
  SearchListingItem,
} from "@src/lib/reddit/models";
import { Logger } from "@src/lib/logger";
import {
  getClient as getRedditClient,
  Client as RedditClient,
} from "@src/lib/reddit/client";
import { Client as SSMClient, getParameter } from "@src/lib/ssm";
import { Keyword } from "@src/domain/models/keyword";
import { RedditSearchResult } from "@src/domain/models/searchResult";
import { fromUnix } from "@src/lib/date";

export const getClient = getRedditClient;
export type Client = RedditClient;

export const getClientCredentials = async (
  ssmClient: SSMClient,
  logger: Logger
) => {
  const result = await getParameter(
    ssmClient,
    { Name: "reddit_app_keys", WithDecryption: true },
    (value: string) => {
      return decode(redditCredentialsCodec, JSON.parse(value));
    },
    logger
  );
  if (isLeft(result) || typeof result.right == "string") {
    throw new Error("Failed to retrieve Reddit Credentials");
  }

  return result.right;
};

export const outToDomain = (
  keyword: Keyword,
  out: SearchListingItem
): RedditSearchResult => ({
  socialMedia: "reddit",
  id: out.id,
  keyword,
  happenedAt: fromUnix(out.created_utc),
  data: out,
  link: `https://reddit.com${out.permalink}`,
});
