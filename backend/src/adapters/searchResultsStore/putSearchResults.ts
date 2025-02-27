import { PutSearchResultsFn } from "@src/domain/ports/searchResultsStore/putSearchResults";
import { eitherListToDefaultOk } from "@src/domain/ports/shared";
import { putItem } from "@src/lib/dynamoDb";
import { Client, searchResultToDocument } from "./client";

export const makePutSearchResults = (
  client: Client,
  tableName: string
): PutSearchResultsFn => {
  return async (logger, searchResults) => {
    const putResults = await Promise.all(
      searchResults.map(async (searchResult) => {
        return await putItem(
          client,
          {
            TableName: tableName,
            Item: searchResultToDocument(searchResult),
            ConditionExpression: "attribute_not_exists(pk)",
          },
          logger
        );
      })
    );

    return eitherListToDefaultOk(putResults);
  };
};
