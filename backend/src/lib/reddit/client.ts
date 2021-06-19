import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  RedditCredentials,
  SearchListing,
  searchListingCodec,
  SearchListingItem,
} from "./models";
import { Logger } from "../logger";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { DefaultOkReturn } from "../../domain/ports/shared";
import qs from "qs";
import { DateISOString, decode } from "@diogovasconcelos/lib/iots";
import { getSecondsAfter } from "../date";
import { deepmergeSafe } from "@diogovasconcelos/lib";

export const getClient = (
  credentials: RedditCredentials
): {
  instance: AxiosInstance;
  data: RedditCredentials & {
    token?: {
      access: string;
      expiresAt: DateISOString;
    };
  };
} => {
  // Look into https://www.npmjs.com/package/oauth if we want to use the key/secret to fetch the token
  return {
    instance: axios.create({
      //baseURL: "https://www.reddit.com/api/",
      baseURL: "https://oauth.reddit.com/",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }),
    data: { ...credentials },
  };
};
export type Client = ReturnType<typeof getClient>;

export type RedditDependencies = {
  client: Client;
  logger: Logger;
};

// https://github.com/reddit-archive/reddit/wiki/OAuth2-Quick-Start-Example
const ensureToken = async ({
  client,
  logger,
}: RedditDependencies): DefaultOkReturn => {
  if (client.data.token != undefined) {
    if (new Date(client.data.token.expiresAt) > new Date()) {
      // hasn't expired, still valid
      return right("OK");
    }
  }

  const request: AxiosRequestConfig = {
    baseURL: "https://www.reddit.com/",
    url: "api/v1/access_token",
    method: "POST",
    data: qs.stringify({
      grant_type: "password",
      username: client.data.username,
      password: client.data.password,
    }),
    auth: {
      username: client.data.id,
      password: client.data.secret,
    },
  };

  const response = await doRequest(client, request);
  if (response.status != 200) {
    logger.error(
      "reddit::ensureToken/access_token response returned failed status code",
      { status: response.status, data: response.data }
    );
    return left("ERROR");
  }
  if (response.data.error != undefined) {
    logger.error("reddit::ensureToken/access_token response returned error", {
      error: response.data.error,
    });
    return left("ERROR");
  }

  client.data.token = {
    access: response.data.access_token,
    expiresAt: getSecondsAfter(response.data.expires_in - 1),
  };

  logger.debug("reponsde data", { data: response.data });
  return right("OK");
};

// ++++++++++
// + SEARCH +
// ++++++++++
// https://www.reddit.com/dev/api/#GET_search

export type SearchParams = {
  limit: number;
  sort: "relevance" | "hot" | "top" | "new" | "comments";
  t: "hour" | "day" | "week" | "month" | "year" | "all";
  include_over_18: boolean;
};

const defaultSearchRequestParams: SearchParams = {
  limit: 100,
  sort: "relevance",
  t: "hour",
  include_over_18: true,
};

export const searchOnUser = async (
  { client, logger }: RedditDependencies,
  keyword: string,
  params?: Partial<SearchParams>
): Promise<ReturnType<typeof handleSearchResponse>> => {
  const ensureTokenEither = await ensureToken({ client, logger });
  if (isLeft(ensureTokenEither)) {
    return ensureTokenEither;
  }

  const request: AxiosRequestConfig = {
    url: "search",
    method: "GET",
    data: qs.stringify({
      ...deepmergeSafe(defaultSearchRequestParams, params ?? {}),
      q: keyword,
    }),
    headers: {
      Authorization: `Bearer ${client.data.token?.access}`,
    },
  };

  const response = await doRequest(client, request);
  return handleSearchResponse(logger, response);
};

export const searchAll = async (
  { client, logger }: RedditDependencies,
  keyword: string,
  params?: Partial<SearchParams>
): Promise<Either<"ERROR", SearchListingItem[]>> => {
  let results: SearchListingItem[] = [];
  let after: string | undefined = undefined;

  const mergedParams = deepmergeSafe(defaultSearchRequestParams, params ?? {});

  do {
    const request: AxiosRequestConfig = {
      baseURL: "https://www.reddit.com/search.json",
      method: "GET",
      params: {
        ...mergedParams,
        limit: Math.min(mergedParams.limit, 100),
        q: keyword,
      },
    };

    const responseRaw = await doRequest(client, request);
    const responseEither = handleSearchResponse(logger, responseRaw);
    if (isLeft(responseEither)) {
      return responseEither;
    }

    after = responseEither.right.data.after;
    results = [
      ...results,
      ...responseEither.right.data.children.map((children) => children.data),
    ];
  } while (after != undefined && results.length < mergedParams.limit);

  return right(results);
};

const handleSearchResponse = (
  logger: Logger,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: AxiosResponse<any>
): Either<"ERROR", SearchListing> => {
  if (response.status != 200) {
    logger.error("reddit::search response returned failed status code", {
      status: response.status,
      data: response.data,
    });
    return left("ERROR");
  }
  if (response.data.error != undefined) {
    logger.error("reddit::search response returned error", {
      error: response.data.error,
    });
    return left("ERROR");
  }

  logger.debug("response data", { data: response.data });
  const decodeEither = decode(searchListingCodec, response.data);
  if (isLeft(decodeEither)) {
    logger.error("reddit::search failed to decode response", {
      error: decodeEither.left,
    });
    return left("ERROR");
  }

  return right(decodeEither.right);
};

const doRequest = async (client: Client, request: AxiosRequestConfig) => {
  return await client.instance.request({
    validateStatus: (status: number) => {
      return status >= 100 && status <= 600;
    },
    ...request,
  });
};
