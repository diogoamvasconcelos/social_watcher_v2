import {
  Client,
  esUnknownToSearchResult,
  searchResultIndexAlias,
} from "./client";
import { RequestParamsSearch, search } from "../../lib/elasticsearch/client";
import { JsonObjectEncodable } from "@diogovasconcelos/lib";
import {
  SearchSearchResultsFn,
  searchSearchResultsResultCodec,
} from "../../domain/ports/searchResultsSearchEngine/searchSearchResults";
import { isLeft, left } from "fp-ts/lib/Either";
import { decode } from "@diogovasconcelos/lib";

const DEFAULT_LIMIT = 50;
const DEFAULT_OFFSET = 0;

export const makeSearchSearchResults = (
  client: Client
): SearchSearchResultsFn => {
  return async (logger, { keyword, dataQuery, pagination }) => {
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
        sort: [{ _score: "desc" }, { happenedAt: "desc" }, { _id: "asc" }],
      },
      size: pagination?.limit ?? DEFAULT_LIMIT,
      from: pagination?.offset ?? DEFAULT_OFFSET,
    };

    const resultEither = await search(
      { logger, client },
      {
        indexName: searchResultIndexAlias,
        transformFn: esUnknownToSearchResult,
        searchParams,
      }
    );
    if (isLeft(resultEither)) {
      return resultEither;
    }

    const decodedResultEither = decode(
      searchSearchResultsResultCodec,
      resultEither.right
    );
    if (isLeft(decodedResultEither)) {
      logger.error("Fail to decode search result", {
        errors: decodedResultEither.left,
      });
      return left("ERROR");
    }
    return decodedResultEither;
  };
};
