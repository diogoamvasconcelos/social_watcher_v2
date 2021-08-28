/*
  https://hn.algolia.com/api
  - rate limit: 10000 request / hour
*/

import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { decode, toSingleEither } from "@diogovasconcelos/lib/iots";
import { JsonEncodable } from "@diogovasconcelos/lib/models/jsonEncodable";
import axios, { AxiosRequestConfig } from "axios";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { PartialDeep } from "type-fest";
import { doRequest } from "@src/lib/axios";
import { getMinutesAgo, toUnixTimstamp } from "@src/lib/date";
import { Logger } from "@src/lib/logger";
import {
  GetItemHackernewsResponse,
  getItemHackernewsResponseCodec,
  SearchHackernewsItem,
  searchHackernewsResponseCodec,
  SearchHackernewsResponseItem,
} from "./models";
import Fuse from "fuse.js";

export const getClient = () => {
  return axios.create({
    baseURL: "http://hn.algolia.com/api/",
  });
};
export type Client = ReturnType<typeof getClient>;

type HackernewsDependencies = {
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
  { client, logger }: HackernewsDependencies,
  keyword: string,
  params?: PartialDeep<SearchParams>
): Promise<Either<string[], SearchHackernewsItem[]>> => {
  const searchParams = deepmergeSafe(defaultSearchParams, params ?? {});

  let results: SearchHackernewsItem[] = [];
  let page = 0;

  const timestamp = toUnixTimstamp(
    new Date(getMinutesAgo(searchParams.minutesAgo))
  );

  do {
    const request: AxiosRequestConfig = {
      url: "v1/search",
      method: "GET",
      params: {
        page,
        // https://www.algolia.com/doc/api-reference/api-parameters/hitsPerPage/
        hitsPerPage: Math.min(searchParams.maxResults, 1000),
        numericFilters: `created_at_i>${timestamp}`,
        query: keyword,
      },
    };

    const responseRaw = await doRequest(client, request);
    logger.debug("hackernews search response", {
      response: responseRaw as unknown as JsonEncodable,
      keyword,
    });
    if (responseRaw.status != 200) {
      return left([`${responseRaw.status} : ${responseRaw.data}`]);
    }

    const responseEither = decode(
      searchHackernewsResponseCodec,
      responseRaw.data
    );
    if (isLeft(responseEither)) {
      return responseEither;
    }
    const response = responseEither.right;

    const filteredResults = filterUnrelatedToKeyword(keyword, response.hits);

    const patchedItemsEither = toSingleEither(
      await Promise.all(
        filteredResults.map(async (item) => {
          let num_comments = item.num_comments;
          if (!num_comments) {
            // try to get the item of the parent to check it's num_comments
            const fetchedItemEither = await getItem(
              { client, logger },
              item.parent_id ? item.parent_id.toString() : item.objectID
            );
            if (isLeft(fetchedItemEither)) {
              return fetchedItemEither;
            }

            num_comments = fetchedItemEither.right.numComments;
          }

          return right({
            ...item,
            num_comments,
            fuzzy_match: isFuzzyMatch(keyword, item),
          });
        })
      )
    );
    if (isLeft(patchedItemsEither)) {
      return left(patchedItemsEither.left.flat());
    }

    results = [...results, ...patchedItemsEither.right];

    page = response.page < response.nbPages - 1 ? response.page + 1 : -1;
  } while (page > -1 && results.length < searchParams.maxResults);

  return right(results);
};

export const getItem = async (
  { client, logger }: HackernewsDependencies,
  id: string
): Promise<
  Either<string[], GetItemHackernewsResponse & { numComments: number }>
> => {
  const request: AxiosRequestConfig = {
    url: `v1/items/${id}`,
    method: "GET",
  };

  const responseRaw = await doRequest(client, request);
  logger.debug("hackernews getItem response", {
    response: responseRaw as unknown as JsonEncodable,
    id,
  });
  if (responseRaw.status != 200) {
    return left([`${responseRaw.status} : ${responseRaw.data}`]);
  }

  const responseEither = decode(
    getItemHackernewsResponseCodec,
    responseRaw.data
  );
  if (isLeft(responseEither)) {
    return responseEither;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countComments = (data: GetItemHackernewsResponse): number => {
    if (!data.children?.length) return 0;

    return data.children.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (acc: number, currChild: any) => acc + countComments(currChild),
      data.children.length
    );
  };

  return right({
    ...responseEither.right,
    numComments: countComments(responseRaw.data),
  });
};

const filterUnrelatedToKeyword = (
  keyword: string,
  items: SearchHackernewsResponseItem[]
) => {
  // https://fusejs.io/api/options.html
  const fuse = new Fuse(items, {
    includeScore: true,
    shouldSort: false,
    ignoreLocation: true,
    threshold: 0.2, // 0 = exact match, 1 = match everything
    keys: ["comment_text", "title"],
  });

  const result = fuse.search(keyword);
  return result.map((resultItem) => resultItem.item);
};

const isFuzzyMatch = (keyword: string, item: SearchHackernewsResponseItem) => {
  // https://fusejs.io/api/options.html
  const fuse = new Fuse([item], {
    includeScore: true,
    ignoreLocation: true,
    threshold: 0, // 0 = exact match, 1 = match everything
    keys: ["comment_text", "title"],
  });

  const result = fuse.search(keyword);
  return result.length == 0;
};
