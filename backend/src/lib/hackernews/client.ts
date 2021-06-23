/*
  https://hn.algolia.com/api
  - rate limit: 10000 request / hour
*/

import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { decode } from "@diogovasconcelos/lib/iots";
import axios, { AxiosRequestConfig } from "axios";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { PartialDeep } from "type-fest";
import { doRequest } from "../axios";
import { getMinutesAgo, toUnixTimstamp } from "../date";
import { Logger } from "../logger";
import { SearchHNResponse, searchHNResponseCodec } from "./models";

export const getClient = () => {
  return axios.create({
    baseURL: "http://hn.algolia.com/api/",
  });
};
export type Client = ReturnType<typeof getClient>;

export type HNDependencies = {
  client: Client;
  logger: Logger;
};

// ++++++++++
// + SEARCH +
// ++++++++++
// https://hn.algolia.com/api

export type SearchParams = {
  maxResults: number;
  minutesAgo: number;
};

const defaultSearchParams: SearchParams = {
  maxResults: 100,
  minutesAgo: 10,
};

export const search = async (
  { client, logger }: HNDependencies,
  keyword: string,
  params?: PartialDeep<SearchParams>
): Promise<Either<string[], SearchHNResponse["hits"]>> => {
  let results: SearchHNResponse["hits"] = [];
  let page = 0;

  const mergedParams = deepmergeSafe(defaultSearchParams, params ?? {});

  const timestamp = toUnixTimstamp(
    new Date(getMinutesAgo(mergedParams.minutesAgo))
  );

  do {
    const request: AxiosRequestConfig = {
      url: "v1/search",
      method: "GET",
      params: {
        page,
        // https://www.algolia.com/doc/api-reference/api-parameters/hitsPerPage/
        hitsPerPage: Math.min(mergedParams.maxResults, 1000),
        numericFilters: `created_at_i>${timestamp}`,
        query: keyword,
      },
    };

    const responseRaw = await doRequest(client, request);
    logger.debug("hackernews search response", {
      data: responseRaw.data,
      keyword,
    });
    if (responseRaw.status != 200) {
      return left([`${responseRaw.status} : ${responseRaw.data}`]);
    }

    const responseEither = decode(searchHNResponseCodec, responseRaw.data);
    if (isLeft(responseEither)) {
      return responseEither;
    }
    const response = responseEither.right;

    page = response.page < response.nbPages ? response.page + 1 : -1;

    results = [...results, ...response.hits];
  } while (page > -1 && results.length < mergedParams.maxResults);

  return right(results);
};
