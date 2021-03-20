import { SocialMedia } from "../../domain/models/socialMedia";
import { GetActiveKeywordsFn } from "../../domain/ports/keywordStore/getActiveKeywords";
import { queryItems } from "../../lib/dynamoDb";
import { getClient, toGSI1PK, unknownToDomain } from "./client";

export const makeGetActiveKeywords = (
  client: ReturnType<typeof getClient>,
  tableName: string
): GetActiveKeywordsFn => {
  return async (socialMedia: SocialMedia) => {
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
