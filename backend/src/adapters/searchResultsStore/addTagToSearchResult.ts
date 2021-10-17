import { AddTagToSearchResultFn } from "@src/domain/ports/searchResultsStore/addTagToSearchResult";
import { updateItem } from "@src/lib/dynamoDb";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
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
    const createNewList = searchResult.tags == undefined; // otherwise append to existing list

    const updateExpression: Pick<
      DocumentClient.UpdateItemInput,
      | "UpdateExpression"
      | "ConditionExpression"
      | "ExpressionAttributeNames"
      | "ExpressionAttributeValues"
    > = createNewList
      ? {
          UpdateExpression: "SET #t = :tag_list",
          ConditionExpression: "attribute_not_exists(#t)",
          ExpressionAttributeNames: { "#t": "tags" },
          ExpressionAttributeValues: { ":tag_list": [tagId] },
        }
      : {
          UpdateExpression: "SET #t = list_append(#t, :tag_list)",
          ConditionExpression: "not contains(#t, :tag)",
          ExpressionAttributeNames: { "#t": "tags" },
          ExpressionAttributeValues: { ":tag": tagId, ":tag_list": [tagId] },
        };

    const resultEither = await updateItem(
      client,
      {
        ...updateExpression,
        TableName: tableName,
        Key: searchResultToPrimaryKey(searchResult.id),
        ReturnValues: "ALL_NEW",
      },
      unknownToSearchResult,
      { allowAttributeDoesntExist: true },
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

    if (resultEither.right === "ATTRIBUTE_DOES_NOT_EXIST") {
      logger.error(
        "Failed to add tag to search result: tags list is null but append was attempt",
        {
          tag: tagId,
        }
      );
      return left("ERROR");
    }

    return right(resultEither.right); // tsc complains when just returning resultEither
  };
};
