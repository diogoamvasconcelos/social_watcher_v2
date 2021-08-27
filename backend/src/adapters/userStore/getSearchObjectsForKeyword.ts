import { GetSearchObjectsForKeywordFn } from "@src/domain/ports/userStore/getSearchObjectsForKeyword";
import { queryItems } from "@src/lib/dynamoDb";
import { Client, unknownToSearchObject } from "./client";

export const makeGetSearchObjectsForKeyword = (
  client: Client,
  tableName: string
): GetSearchObjectsForKeywordFn => {
  return async (logger, keyword) => {
    return await queryItems(
      client,
      {
        TableName: tableName,
        IndexName: "gsi1",
        KeyConditionExpression: "#gsi1pk = :gsi1pk",
        ExpressionAttributeNames: { "#gsi1pk": "gsi1pk" },
        ExpressionAttributeValues: {
          ":gsi1pk": keyword,
        },
      },
      unknownToSearchObject,
      logger
    );
  };
};
