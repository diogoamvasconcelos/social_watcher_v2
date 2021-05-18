import axios, { AxiosRequestConfig } from "axios";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { getMinutesAgo } from "./date";
import { dateISOString, decode, optional } from "@shared/lib/src/lib/iots";

export const twitterCredentialsCodec = t.type({
  apiKey: t.string,
  apiSecretKey: t.string,
  bearerToken: t.string,
});
export type TwitterCredentials = t.TypeOf<typeof twitterCredentialsCodec>;

export const getClient = (credentials: TwitterCredentials) => {
  // Look into https://www.npmjs.com/package/oauth if we want to use the key/secret to fetch the token
  return axios.create({
    baseURL: "https://api.twitter.com/",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${credentials.bearerToken}`,
    },
  });
};
export type Client = ReturnType<typeof getClient>;

export const searchRecentResponseDataCodec = t.type({
  id: t.string,
  text: t.string,
  created_at: dateISOString,
  conversation_id: t.string,
  author_id: t.string,
  lang: t.string,
});
export const searchRecentResponseMetaCodec = t.type({
  result_count: t.number,
  newest_id: optional(t.string),
  oldest_id: optional(t.string),
  next_token: optional(t.string),
});
export const searchRecentResponseCodec = t.type({
  data: t.array(searchRecentResponseDataCodec),
  meta: searchRecentResponseMetaCodec,
});
export type SearchRecentResponse = t.TypeOf<typeof searchRecentResponseCodec>;

export type SearchRecentOptions = {
  maxResults: number;
  minutesAgo: number;
};

// https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent
export const searchRecent = async (
  client: Client,
  keyword: string,
  { maxResults, minutesAgo }: SearchRecentOptions = {
    maxResults: 100,
    minutesAgo: 10,
  }
): Promise<Either<string[], SearchRecentResponse["data"]>> => {
  let results: SearchRecentResponse["data"] = [];
  let token: string | undefined = undefined;

  do {
    const request: AxiosRequestConfig = {
      params: {
        query: `${keyword} -is:retweet`,
        max_results: Math.min(maxResults, 100),
        next_token: token,
        start_time: getMinutesAgo(minutesAgo),
        "tweet.fields": [
          "created_at",
          "lang",
          "conversation_id",
          "author_id",
        ].join(","),
      },
      url: "2/tweets/search/recent",
      method: "GET",
    };

    const response = await doRequest(client, request);
    if (response.status != 200) {
      return left([`${response.status} : ${response.data}`]);
    }

    if (response.data["data"] == undefined) {
      response.data["data"] = [];
    }

    const decodeResult = decode(searchRecentResponseCodec, response.data);
    if (isLeft(decodeResult)) {
      return decodeResult;
    }

    token = decodeResult.right.meta.next_token;
    results = [...results, ...decodeResult.right.data];
  } while (token != undefined && results.length < maxResults);

  return right(results);
};

const doRequest = async (client: Client, request: AxiosRequestConfig) => {
  return await client.request({
    validateStatus: (status: number) => {
      return status >= 100 && status <= 600;
    },
    ...request,
  });
};
