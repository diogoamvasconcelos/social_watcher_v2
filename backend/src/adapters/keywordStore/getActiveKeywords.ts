import { GetActiveKeywordsFn } from "@src/domain/ports/keywordStore/getActiveKeywords";
import { queryItems } from "@src/lib/dynamoDb";
import { Client, toGSI1PK, unknownToKeywordData } from "./client";

export const makeGetActiveKeywords = (
  client: Client,
  tableName: string
): GetActiveKeywordsFn => {
  return async (logger, socialMedia) => {
    return await queryItems(
      client,
      {
        TableName: tableName,
        IndexName: "gsi1",
        KeyConditionExpression: "#gsi1pk = :gsi1pk",
        ExpressionAttributeNames: { "#gsi1pk": "gsi1pk" },
        ExpressionAttributeValues: {
          ":gsi1pk": toGSI1PK(socialMedia),
        },
      },
      unknownToKeywordData,
      logger
    );
  };
};
