import { GetSearchResultFn } from "@src/domain/ports/searchResultsStore/getSearchResult";
import { getItem } from "@src/lib/dynamoDb";
import {
  Client,
  searchResultToPrimaryKey,
  unknownToSearchResult,
} from "./client";

export const makeGetSearchResult = (
  client: Client,
  tableName: string
): GetSearchResultFn => {
  return async (logger, searchResultId) => {
    return await getItem(
      client,
      {
        TableName: tableName,
        Key: searchResultToPrimaryKey(searchResultId),
      },
      unknownToSearchResult,
      logger
    );
  };
};
