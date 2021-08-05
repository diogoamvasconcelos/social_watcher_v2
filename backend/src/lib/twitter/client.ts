import axios, { AxiosRequestConfig } from "axios";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { decode, toSingleEither } from "@diogovasconcelos/lib/iots";
import {
  GetUserResponse,
  getUserResponseCodec,
  SearchRecentResponse,
  searchRecentResponseCodec,
  TwitterCredentials,
} from "./models";
import { getMinutesAgo } from "../date";
import { doRequest } from "../axios";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { Logger } from "../logger";

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

type TwitterDependencies = {
  client: Client;
  logger: Logger;
};

// ++++++++++++++++
// + SearchRecent +
// ++++++++++++++++
// https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent

export type SearchParams = {
  maxResults: number;
  minutesAgo: number;
};

const defaultSearchRequestParams: SearchParams = {
  maxResults: 100,
  minutesAgo: 10,
};

export const searchRecent = async (
  { logger, client }: TwitterDependencies,
  keyword: string,
  params?: Partial<SearchParams>
): Promise<Either<string[], SearchRecentResponse["data"]>> => {
  const searchParams = deepmergeSafe(defaultSearchRequestParams, params ?? {});

  let results: SearchRecentResponse["data"] = [];
  let token: string | undefined = undefined;

  const startTime = getMinutesAgo(searchParams.minutesAgo);

  do {
    const request: AxiosRequestConfig = {
      params: {
        query: `${keyword} -is:retweet`,
        max_results: Math.min(searchParams.maxResults, 100),
        next_token: token,
        start_time: startTime,
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

    const responseEither = decode(searchRecentResponseCodec, response.data);
    if (isLeft(responseEither)) {
      return responseEither;
    }

    const patchedItemsEither = toSingleEither(
      await Promise.all(
        responseEither.right.data.map(async (item) => {
          // get followers count from author
          const userEither = await getUser({ client, logger }, item.author_id);
          if (isLeft(userEither)) {
            return userEither;
          }

          return right({
            ...item,
            followers_count: userEither.right.public_metrics.followers_count,
          });
        })
      )
    );
    if (isLeft(patchedItemsEither)) {
      return left(patchedItemsEither.left.flat());
    }

    results = [...results, ...patchedItemsEither.right];

    token = responseEither.right.meta.next_token;
  } while (token != undefined && results.length < searchParams.maxResults);

  return right(results);
};

// +++++++++
// + Users +
// +++++++++
// https://developer.twitter.com/en/docs/labs/tweets-and-users/api-reference/get-users-id

export const getUser = async (
  { logger: _logger, client }: TwitterDependencies,
  userId: string
): Promise<Either<string[], GetUserResponse["data"]>> => {
  const request: AxiosRequestConfig = {
    params: {
      "user.fields": ["public_metrics"].join(","),
    },
    url: `labs/2/users/${userId}`,
    method: "GET",
  };

  const response = await doRequest(client, request);
  if (response.status != 200) {
    return left([`${response.status} : ${response.data}`]);
  }

  const responseEither = decode(getUserResponseCodec, response.data);
  if (isLeft(responseEither)) {
    return responseEither;
  }

  return right(responseEither.right.data);
};
