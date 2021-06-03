import { Keyword } from "../../domain/models/keyword";
import { TwitterSearchResult } from "../../domain/models/searchResult";
import { Logger } from "../../lib/logger";
import {
  getClient as getTwitterClient,
  Client as TwitterClient,
} from "../../lib/twitter/client";
import { Client as SSMClient, getParameter } from "../../lib/ssm";
import { decode } from "@diogovasconcelos/lib";
import { isLeft } from "fp-ts/lib/Either";
import {
  SearchRecentResponseItem,
  twitterCredentialsCodec,
} from "../../lib/twitter/models";

export const getClient = getTwitterClient;
export type Client = TwitterClient;

export const getClientCredentials = async (
  ssmClient: SSMClient,
  logger: Logger
) => {
  const result = await getParameter(
    ssmClient,
    { Name: "twitter_bot_keys", WithDecryption: true },
    (value: string) => {
      return decode(twitterCredentialsCodec, JSON.parse(value));
    },
    logger
  );
  if (isLeft(result) || typeof result.right == "string") {
    throw new Error("Failed to retrieve Twitter Credentials");
  }

  return result.right;
};

export const outToDomain = (
  keyword: Keyword,
  out: SearchRecentResponseItem
): TwitterSearchResult => ({
  socialMedia: "twitter",
  id: out.id,
  keyword,
  happenedAt: out.created_at,
  data: out,
  link: `https://twitter.com/x/status/${out.id}`,
});
