import axios, { AxiosRequestConfig } from "axios";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { getMinutesAgo } from "./date";
import { DateFromISOString } from "io-ts-types/DateFromISOString";
import { decode } from "./iots";

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

// TODO: move specifics to port and adapter
export type SearchRecentOptions = {
  maxResults: number;
  minutesAgo: number;
};

export const searchRecentResponseCodec = t.type({
  data: t.array(
    t.type({
      id: t.string,
      text: t.string,
      created_at: DateFromISOString,
      conversation_id: t.string,
      author_id: t.string,
      lang: t.string,
    })
  ),
  meta: t.type({
    newest_id: t.string,
    oldest_id: t.string,
    result_count: t.string,
    next_token: t.string,
  }),
});
export type SearchRecentResponse = t.TypeOf<typeof searchRecentResponseCodec>;

export const searchRecent = async (
  client: Client,
  keyword: string,
  { maxResults, minutesAgo }: SearchRecentOptions = {
    maxResults: 10,
    minutesAgo: 10,
  }
): Promise<Either<string[], SearchRecentResponse["data"]>> => {
  // use response `next_token` if paginations is needed (maxResults max is 100)
  const request: AxiosRequestConfig = {
    params: {
      query: `${keyword} -is:retweet`,
      max_results: maxResults,
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
  if (response.status != 400) {
    return left([JSON.stringify(response)]);
  }

  const decodeResult = decode(searchRecentResponseCodec, response.data);
  if (isLeft(decodeResult)) {
    return decodeResult;
  }

  return right(decodeResult.right.data);
};

const doRequest = async (client: Client, request: AxiosRequestConfig) => {
  return await client.request({
    validateStatus: (status: number) => {
      return status >= 100 && status <= 600;
    },
    ...request,
  });
};
