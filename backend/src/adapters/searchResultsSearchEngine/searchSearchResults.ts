import {
  Client,
  esUnknownToSearchResult,
  searchResultIndexAlias,
} from "./client";
import { RequestParamsSearch, search } from "../../lib/elasticsearch/client";
import { JsonObjectEncodable } from "../../lib/models/jsonEncodable";
import { SearchSearchResultsFn } from "../../domain/ports/searchResultsSearchEngine/searchSearchResults";

export const makeSearchSearchResults = (
  client: Client
): SearchSearchResultsFn => {
  return async (logger, keyword, dataQuery) => {
    const queriesMust: JsonObjectEncodable[] = [];
    queriesMust.push({
      constant_score: {
        filter: {
          term: {
            keyword,
          },
        },
      },
    });

    if (dataQuery) {
      queriesMust.push({
        multi_match: {
          query: dataQuery,
          fields: ["data"],
          fuzziness: 0,
        },
      });
    }

    const searchParams: RequestParamsSearch = {
      body: {
        query: {
          bool: {
            must: queriesMust,
          },
        },
      },
    };

    return await search(
      { logger, client },
      {
        indexName: searchResultIndexAlias,
        transformFn: esUnknownToSearchResult,
        searchParams,
      }
    );
  };
};
