import { isLeft, left, right } from "fp-ts/lib/Either";
import _ from "lodash";
import { SearchResult } from "../../domain/models/searchResult";
import { PutSearchResultsFn } from "../../domain/ports/searchResultsStore/putSearchResults";
import { putItem } from "../../lib/dynamoDb";
import { Client, domainToDocument } from "./client";

export const makePutSearchResults = (
  client: Client,
  tableName: string
): PutSearchResultsFn => {
  return async (searchResults: SearchResult[]) => {
    const putResults = await Promise.all(
      searchResults.map(async (searchResult) => {
        return await putItem(client, {
          TableName: tableName,
          Item: domainToDocument(searchResult),
          ConditionExpression: "attribute_not_exists(krn)",
        });
      })
    );

    if (_.some(putResults, (result) => isLeft(result))) {
      return left("ERROR");
    }
    return right("OK");
  };
};
