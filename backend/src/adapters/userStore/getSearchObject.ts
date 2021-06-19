import { GetSearchObjectFn } from "../../domain/ports/userStore/getSearchObject";
import { getItem } from "../../lib/dynamoDb";
import {
  Client,
  toSearchObjectDocumentPartitionKeys,
  unknownToSearchObject,
} from "./client";

export const makeGetSearchObject = (
  client: Client,
  tableName: string
): GetSearchObjectFn => {
  return async (logger, id, index) => {
    return await getItem(
      client,
      {
        TableName: tableName,
        Key: toSearchObjectDocumentPartitionKeys({ id, index }),
        ConsistentRead: true,
      },
      unknownToSearchObject,
      logger
    );
  };
};
