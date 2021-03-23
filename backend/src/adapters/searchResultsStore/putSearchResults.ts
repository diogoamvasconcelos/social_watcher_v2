import { SearchResult } from "../../domain/models/searchResult";
import { PutSearchResultsFn } from "../../domain/ports/searchResultsStore/putSearchResults";
import { putItem } from "../../lib/dynamoDb";
import { Client } from "./client";

export const makePutSearchResults = (
  client: Client,
  tableName: string
): PutSearchResultsFn => {
  return async (searchResults: SearchResult[]) => {
    return await putItem(
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
