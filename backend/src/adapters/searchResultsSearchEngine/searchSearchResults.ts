import {
  Client,
  esUnknownToSearchResult,
  searchResultIndexAlias,
} from "./client";
import { RequestParamsSearch, search } from "@src/lib/elasticsearch/client";
import {
  SearchSearchResultsFn,
  searchSearchResultsResultCodec,
} from "@src/domain/ports/searchResultsSearchEngine/searchSearchResults";
import { isLeft, left } from "fp-ts/lib/Either";
import { JsonObjectEncodable } from "@diogovasconcelos/lib/models/jsonEncodable";
import { decode } from "@diogovasconcelos/lib/iots";

const DEFAULT_LIMIT = 50;
const DEFAULT_OFFSET = 0;

export const makeSearchSearchResults = (
  client: Client
): SearchSearchResultsFn => {
  return async (
    logger,
    { keywords, dataQuery, timeQuery, socialMediaQuery, pagination }
  ) => {
    const queriesMust: JsonObjectEncodable[] = [];
    // keyword
    queriesMust.push({
      constant_score: {
        filter: {
          terms: {
            keyword: keywords,
          },
        },
      },
    });
    // data / text
    if (dataQuery) {
      queriesMust.push({
        multi_match: {
          query: dataQuery,
          fields: ["data"],
          fuzziness: 0,
        },
      });
    }
    // timerange
    if (timeQuery) {
      queriesMust.push(
        makeGreaterLessThanQuery({
          property: "happenedAt",
          gte: timeQuery.happenedAtStart,
          lte: timeQuery.happenedAtEnd,
        })
      );
    }
    // socialMedia
    if (socialMediaQuery) {
      queriesMust.push({
        constant_score: {
          filter: {
            terms: {
              socialMedia: socialMediaQuery,
            },
          },
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

const makeGreaterLessThanQuery = ({
  property,
  gte,
  lte,
}: {
  property: string;
  gte?: string;
  lte?: string;
}) => {
  return {
    constant_score: {
      filter: {
        range: {
          [property]: { gte, lte },
        },
      },
    },
  };
};
