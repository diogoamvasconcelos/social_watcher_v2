import axios, { AxiosRequestConfig } from "axios";
import * as t from "io-ts";
import { getMinutesAgo } from "./date";

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
export const searchRecent = async (
  client: Client,
  keyword: string,
  { maxResults, minutesAgo }: SearchRecentOptions = {
    maxResults: 10,
    minutesAgo: 20,
  }
) => {
  // use response `next_token` if paginations is needed (maxResults max is 100)
  const request: AxiosRequestConfig = {
    params: {
      query: `${keyword} -is:retweet`,
      max_results: maxResults,
      start_time: getMinutesAgo(minutesAgo),
      "place.fields": "country",
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
  console.log(response);
};

const doRequest = async (client: Client, request: AxiosRequestConfig) => {
  return await client.request({
    validateStatus: (status: number) => {
      return status >= 100 && status <= 600;
    },
    ...request,
  });
};
