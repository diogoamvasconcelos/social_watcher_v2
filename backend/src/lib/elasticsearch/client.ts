import * as AWS from "aws-sdk";
import { Client } from "@elastic/elasticsearch";
import createAwsElasticsearchConnector from "aws-elasticsearch-connector";
import { Logger } from "../logger";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { JsonObjectEncodable } from "@diogovasconcelos/lib";
import { applyTransformToItem } from "../iots";

const isLocalHost = (url?: string) => {
  return url?.includes("localhost");
};

export const getClient = (elasticsearchUrl: string): Client => {
  if (isLocalHost(elasticsearchUrl)) {
    return new Client({
      node: elasticsearchUrl,
    });
  } else {
    return new Client({
      ...createAwsElasticsearchConnector(AWS.config),
      node: elasticsearchUrl,
    });
  }
};

// extend this type if needed
// ref: https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-create-index.html
export type IndexSchema = {
  aliases?: Object;
  mappings?: Object;
  settings?: { index: Object };
};

type dependencies = {
  logger: Logger;
  client: Client;
};

export const createIndex = async (
  { logger, client }: dependencies,
  {
    indexName,
    indexSchema,
  }: {
    indexName: string;
    indexSchema: IndexSchema;
  }
) => {
  try {
    await client.indices.create({
      index: indexName,
      body: indexSchema,
    });
    return right("OK");
  } catch (error) {
    logger.error(`Failed to create index with name=${indexName}`, { error });
    return left("ERROR");
  }
};

export const deleteIndex = async (
  { logger, client }: dependencies,
  indexName: string
) => {
  try {
    await client.indices.delete({
      index: indexName,
    });
    return right("OK");
  } catch (error) {
    logger.error(`Failed to delete index with name=${indexName}`, { error });
    return left("ERROR");
  }
};

export const indexExists = async (
  { logger, client }: dependencies,
  indexName: string
) => {
  try {
    const result = await client.indices.exists({ index: indexName });
    return right(result.body);
  } catch (error) {
    logger.error(`Failed to check if exists index with name=${indexName}`, {
      error,
    });
    return left("ERROR");
  }
};

export const addAliasToIndex = async (
  { logger, client }: dependencies,
  {
    indexName,
    aliasName,
  }: {
    indexName: string;
    aliasName: string;
  }
) => {
  try {
    await client.indices.putAlias({
      index: indexName,
      name: aliasName,
    });
    return right("OK");
  } catch (error) {
    logger.error(`Failed to add alias to index (${indexName})`, {
      error,
    });
    return left("ERROR");
  }
};

export const bulkIndex = async (
  { logger, client }: dependencies,
  {
    indexName,
    items,
  }: {
    indexName: string;
    items: { id: string; data: JsonObjectEncodable }[];
  }
): Promise<Either<"ERROR", "OK">> => {
  try {
    const requestBody = items.flatMap((item) => [
      {
        index: {
          _index: indexName,
          _id: item.id,
        },
      },
      item.data,
    ]);

    const response = await client.bulk({ body: requestBody });

    logger.debug("Elasticsearch bulk index request/response", {
      requestBody,
      response: (response as unknown) as JsonObjectEncodable,
    });

    if (response.body.errors) {
      logger.error("Elasticsearch bulk index failed", {
        response: (response as unknown) as JsonObjectEncodable,
      });

      return left("ERROR");
    }

    return right("OK");
  } catch (error) {
    logger.error(`Failed to bulk index to index (${indexName})`, {
      error,
    });
    return left("ERROR");
  }
};

// Extend this type as needed
// Ref: https://www.elastic.co/guide/en/elasticsearch/reference/current/search-search.html#search-search-api-request-body
export type RequestParamsSearch = {
  body?: {
    query?: {
      bool?: {
        must?: JsonObjectEncodable[];
      };
    };
    sort?: Record<string, string>[];
  };
  from?: number;
  size?: number;
};

export const search = async <T>(
  { logger, client }: dependencies,
  {
    indexName,
    searchParams,
    transformFn,
  }: {
    indexName: string;
    searchParams?: RequestParamsSearch;
    transformFn: (item: unknown) => Either<string[], T>;
  }
): Promise<
  Either<
    "ERROR",
    {
      items: T[];
      pagination: {
        limit: number;
        offset: number;
        count: number;
        total: number;
      };
    }
  >
> => {
  try {
    logger.debug("search params", { searchParams });

    const searchResult = await client.search(searchParams);
    if (searchResult.statusCode != 200) {
      logger.error(`Search failed with statusCode=${searchResult.statusCode}`);
      return left("ERROR");
    }

    const items: unknown[] = searchResult.body.hits.hits.map(
      (h: { _source: unknown }) => h._source
    );

    logger.debug("search results", {
      items: (items as unknown) as JsonObjectEncodable,
    });

    const transformedItems: T[] = [];
    for (const item of items) {
      const transformResult = applyTransformToItem(transformFn, item, logger);
      if (isLeft(transformResult)) {
        return transformResult;
      }
      transformedItems.push(transformResult.right);
    }

    return right({
      items: transformedItems,
      pagination: {
        limit: searchParams?.size ?? 0,
        offset: searchParams?.from ?? 0,
        count: transformedItems.length,
        total: searchResult.body.hits.total.value,
      },
    });
  } catch (error) {
    logger.error(`Failed to search index (${indexName})`, {
      error,
    });
    return left("ERROR");
  }
};

export const refreshIndices = async (client: Client) => {
  await client.indices.refresh();
};
