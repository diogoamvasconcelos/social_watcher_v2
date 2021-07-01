/*
  https://hn.algolia.com/api
  - rate limit: 10000 request / hour
*/

import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { decode } from "@diogovasconcelos/lib/iots";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { PartialDeep } from "type-fest";
import { doRequest } from "../axios";
import { getMinutesAgo, toUnixTimstamp } from "../date";
import { Logger } from "../logger";
import {
  GetItemHNResponse,
  getItemHNResponseCodec,
  searchHNResponseCodec,
  SearchHNResponseItem,
} from "./models";

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
): Promise<Either<string[], SearchHNResponseItem[]>> => {
  let results: SearchHNResponseItem[] = [];
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

    const patchedItemsEither = await Promise.all(
      response.hits.map(async (item) => {
        if (item.num_comments) {
          return right(item);
        }

        // try to get the item of the parent to check it's num_comments
        const fetchedItemEither = await getItem(
          { client, logger },
          item.parent_id ? item.parent_id.toString() : item.objectID
        );
        if (isLeft(fetchedItemEither)) {
          return fetchedItemEither;
        }

        return right({
          ...item,
          num_comments: fetchedItemEither.right.numComments,
        });
      })
    );

    let patchedItems: SearchHNResponseItem[] = [];
    for (const itemEither of patchedItemsEither) {
      if (isLeft(itemEither)) {
        return itemEither;
      }
      patchedItems = [...patchedItems, itemEither.right];
    }

    results = [...results, ...patchedItems];

    page = response.page < response.nbPages ? response.page + 1 : -1;
  } while (page > -1 && results.length < mergedParams.maxResults);

  return right(results);
};

export const getItem = async (
  { client, logger }: HNDependencies,
  id: string
): Promise<Either<string[], GetItemHNResponse & { numComments: number }>> => {
  const request: AxiosRequestConfig = {
    url: `v1/items/${id}`,
    method: "GET",
  };

  const responseRaw = await doRequest(client, request);
  logger.debug("hackernews getItem response", {
    data: responseRaw.data,
    id,
  });
  if (responseRaw.status != 200) {
    return left([`${responseRaw.status} : ${responseRaw.data}`]);
  }

  const responseEither = decode(getItemHNResponseCodec, responseRaw.data);
  if (isLeft(responseEither)) {
    return responseEither;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countComments = (rawObj: AxiosResponse<any>["data"]): number => {
    return rawObj.children.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (acc: number, currChild: AxiosResponse<any>["data"]) =>
        acc + countComments(currChild),
      (rawObj.children?.length ?? 0) as number
    );
  };

  return right({
    ...responseEither.right,
    numComments: countComments(responseRaw.data),
  });
};
