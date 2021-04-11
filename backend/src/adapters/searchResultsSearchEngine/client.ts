import { isLeft, right } from "fp-ts/lib/Either";
import { left } from "fp-ts/lib/These";
import {
  addAliasToIndex,
  createIndex,
  getClient as getElasticsearchClient,
  indexExists,
} from "../../lib/elasticsearch/client";
import { PositiveInteger } from "../../lib/iots";
import { Logger } from "../../lib/logger";
import { SEARCH_RESULT_SCHEMA } from "./schemas";

export const getClient = getElasticsearchClient;
export type Client = ReturnType<typeof getClient>;

export const searchResultIndexAlias = "search_result";

export const getSearchResultIndexName = (version: PositiveInteger) =>
  `${searchResultIndexAlias}_v${version}`;
export const getSearchResultSchema = (version: PositiveInteger) =>
  SEARCH_RESULT_SCHEMA[`v${version}`];

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

  const existsEither = await indexExists(logger, client, indexName);
  if (isLeft(existsEither)) {
    return left("ERROR");
  }

  if (existsEither.right) {
    return right("ALREADY_EXISTS");
  }

  const createEither = await createIndex(
    logger,
    client,
    indexName,
    indexSchema
  );
  if (isLeft(createEither)) {
    return left("ERROR");
  }

  const addAliasEither = await addAliasToIndex(logger, client, {
    indexName,
    aliasName: searchResultIndexAlias,
  });
  if (isLeft(addAliasEither)) {
    return left("ERROR");
  }

  return right("OK");
};
