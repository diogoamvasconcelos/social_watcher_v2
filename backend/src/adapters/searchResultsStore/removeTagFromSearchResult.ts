import { RemoveTagFromSearchResultFn } from "@src/domain/ports/searchResultsStore/removeTagFromSearchResult";
import { updateItem } from "@src/lib/dynamoDb";
import { isLeft, left, right } from "fp-ts/lib/Either";
import {
  Client,
  searchResultToPrimaryKey,
  unknownToSearchResult,
} from "./client";

export const makeRemoveTagFromSearchResult = (
  client: Client,
  tableName: string
): RemoveTagFromSearchResultFn => {
  return async (logger, searchResult, tagId) => {
    const tagIndex = searchResult.tags?.indexOf(tagId);
    if (tagIndex == undefined || tagIndex == -1) {
      logger.error(
        "RemoveTagFromSearchResultFn: Failed to find the tag to be removed.",
        { searchResult, tagId }
      );
      return left("ERROR");
    }

    const resultEither = await updateItem(
      client,
      {
        TableName: tableName,
        Key: searchResultToPrimaryKey(searchResult.id),
        UpdateExpression: `REMOVE #t[${tagIndex}]`,
        ConditionExpression: "contains(#t, :tag)",
        ExpressionAttributeNames: { "#t": "tags" },
        ExpressionAttributeValues: { ":tag": tagId },
        ReturnValues: "ALL_NEW",
      },
      unknownToSearchResult,
      { allowAttributeDoesntExist: false },
      logger
    );

    if (isLeft(resultEither)) {
      return resultEither;
    }

    if (resultEither.right === "CONDITION_CHECK_FAILED") {
      logger.error("Failed to remove tag from search result: tag not present", {
        tag: tagId,
      });
      return left("ERROR");
    }

    if (resultEither.right === "ATTRIBUTE_DOES_NOT_EXIST") {
      logger.error(
        "Failed to remove tag from search result: tags list is null",
        { tag: tagId }
      );
      return left("ERROR");
    }

    return right(resultEither.right); // tsc complains when just returning resultEither
  };
};
