import * as AWS from "aws-sdk";
import { Client } from "@elastic/elasticsearch";
import createAwsElasticsearchConnector from "aws-elasticsearch-connector";
import { Logger } from "../logger";
import { left, right } from "fp-ts/lib/Either";

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
