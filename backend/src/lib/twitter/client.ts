import axios, { AxiosRequestConfig } from "axios";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { decode } from "@diogovasconcelos/lib";
import {
  SearchRecentOptions,
  SearchRecentResponse,
  searchRecentResponseCodec,
  TwitterCredentials,
} from "./models";
import { getMinutesAgo } from "../date";
import { doRequest } from "../axios";

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
