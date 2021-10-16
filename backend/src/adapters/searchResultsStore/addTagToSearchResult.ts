import { AddTagToSearchResultFn } from "@src/domain/ports/searchResultsStore/addTagToSearchResult";
import { updateItem } from "@src/lib/dynamoDb";
import { isLeft, left, right } from "fp-ts/lib/Either";
import {
  Client,
  searchResultToPrimaryKey,
  unknownToSearchResult,
} from "./client";

export const makeAddTagToSearchResult = (
  client: Client,
  tableName: string
): AddTagToSearchResultFn => {
  return async (logger, searchResult, tagId) => {
    const resultEither = await updateItem(
      client,
      {
        TableName: tableName,
        Key: searchResultToPrimaryKey(searchResult.id),
        UpdateExpression: "SET #t = list_append(#t, :tag_list)",
        ConditionExpression: "contains(#t, :tag)",
        ExpressionAttributeNames: { "#t": "tags" },
        ExpressionAttributeValues: { ":tag": tagId, ":tag_list": [tagId] },
        ReturnValues: "UPDATED_NEW",
      },
      unknownToSearchResult,
      logger
    );

    if (isLeft(resultEither)) {
      return resultEither;
    }

    if (resultEither.right === "CONDITION_CHECK_FAILED") {
      logger.error("Failed to add tag to search result: tag already added", {
        tag: tagId,
      });
      return left("ERROR");
    }

    return right(resultEither.right); // tsc complains when just returning resultEither
  };
};
