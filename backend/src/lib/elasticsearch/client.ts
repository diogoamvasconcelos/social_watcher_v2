import * as AWS from "aws-sdk";
import { Client } from "@elastic/elasticsearch";
import createAwsElasticsearchConnector from "aws-elasticsearch-connector";
import { Logger } from "../logger";
import { Either, left, right } from "fp-ts/lib/Either";
import { JsonObjectEncodable } from "../models/jsonEncodable";

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

export const createIndex = async (
  logger: Logger,
  client: Client,
  name: string,
  schema: IndexSchema
) => {
  try {
    await client.indices.create({
      index: name,
      body: schema,
    });
    return right("OK");
  } catch (error) {
    logger.error(`Failed to create index with name=${name}`, { error });
    return left("ERROR");
  }
};

export const deleteIndex = async (
  logger: Logger,
  client: Client,
  name: string
) => {
  try {
    await client.indices.delete({
      index: name,
    });
    return right("OK");
  } catch (error) {
    logger.error(`Failed to delete index with name=${name}`, { error });
    return left("ERROR");
  }
};

export const indexExists = async (
  logger: Logger,
  client: Client,
  name: string
) => {
  try {
    const result = await client.indices.exists({ index: name });
    return right(result.body);
  } catch (error) {
    logger.error(`Failed to check if exists index with name=${name}`, {
      error,
    });
    return left("ERROR");
  }
};

export const addAliasToIndex = async (
  logger: Logger,
  client: Client,
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
  logger: Logger,
  client: Client,
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
