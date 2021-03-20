import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { SocialMedia } from "../../core/models/socialMedia";
import { GetActiveKeywordsFn } from "../../core/ports/keywordStore/getActiveKeywords";
import { queryItems } from "../../lib/dynamoDb";
import { toGSI1PK, unknownToDomain } from "./client";

export const makeGetActiveKeywords = (
  client: DocumentClient,
  tableName: string
): GetActiveKeywordsFn => {
  return async (socialMedia: SocialMedia) => {
    console.log(`Quering: ${toGSI1PK(socialMedia)}`);
    return await queryItems(
      client,
      {
        TableName: tableName,
        IndexName: "gsi1",
        KeyConditionExpression: "gsi1pk = :gsi1pk",
        ExpressionAttributeValues: {
          ":gsi1pk": toGSI1PK(socialMedia),
        },
      },
      unknownToDomain
    );
  };
};
