import * as t from "io-ts";
import { isLeft, right, left, chain, Either } from "fp-ts/lib/Either";
import {
  addAliasToIndex,
  createIndex,
  getClient as getElasticsearchClient,
  indexExists,
} from "../../lib/elasticsearch/client";
import { decode, PositiveInteger } from "@diogovasconcelos/lib";
import { Logger } from "../../lib/logger";
import { SEARCH_RESULT_SCHEMA } from "./schemas";
import {
  SearchResult,
  searchResultCodec,
  searchResultMetadaCodec,
} from "../../domain/models/searchResult";
import { socialMediaCodec } from "../../domain/models/socialMedia";

export const getClient = getElasticsearchClient;
export type Client = ReturnType<typeof getClient>;

export const searchResultIndexAlias = "search_result";

export const getSearchResultIndexName = (version: PositiveInteger) =>
  `${searchResultIndexAlias}_v${version}`;
export const getSearchResultSchema = (version: PositiveInteger) =>
  SEARCH_RESULT_SCHEMA[`v${version}`];

export const searchResultEsDocumentCodec = t.intersection([
  searchResultMetadaCodec,
  t.type({
    socialMedia: socialMediaCodec,
    data: t.string,
  }),
]);
export type SearchResultEsDocument = t.TypeOf<
  typeof searchResultEsDocumentCodec
>;

export const searchResultToEsDocument = (
  domainItem: SearchResult
): SearchResultEsDocument => {
  return {
    ...domainItem,
    data: JSON.stringify(domainItem.data),
  };
};

export const esDocumentToSearchResult = (
  docItem: SearchResultEsDocument
): Either<string[], SearchResult> => {
  return decode(searchResultCodec, {
    ...docItem,
    //happenedAt: docItem.happenedAt.toISOString(), //need to covert back for codec to work
    data: JSON.parse(docItem.data),
  });
};

export const esUnknownToSearchResult = (
  item: unknown
): Either<string[], SearchResult> => {
  return chain(esDocumentToSearchResult)(
    decode(searchResultEsDocumentCodec, item)
  );
};

export const createSearchResultIndex = async (
  { logger, client }: { logger: Logger; client: Client },
  version: PositiveInteger
) => {
  const indexName = getSearchResultIndexName(version);
  const indexSchema = getSearchResultSchema(version);
  if (!indexSchema) {
    logger.error(`Failed to get searchResult schema for version=${version}`);
    return left("ERROR");
  }

  const existsEither = await indexExists({ logger, client }, indexName);
  if (isLeft(existsEither)) {
    return left("ERROR");
  }

  if (existsEither.right) {
    return left("ALREADY_EXISTS");
  }

  const createEither = await createIndex(
    { logger, client },
    { indexName, indexSchema }
  );
  if (isLeft(createEither)) {
    return left("ERROR");
  }

  const addAliasEither = await addAliasToIndex(
    { logger, client },
    {
      indexName,
      aliasName: searchResultIndexAlias,
    }
  );
  if (isLeft(addAliasEither)) {
    return left("ERROR");
  }

  return right({ name: indexName, alias: searchResultIndexAlias });
};
