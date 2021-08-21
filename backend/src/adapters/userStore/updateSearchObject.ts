import { isLeft, left, right } from "fp-ts/lib/Either";
import { UpdateSearchObjectFn } from "../../domain/ports/userStore/updateSearchObject";
import { Client, userItemToDocument } from "./client";
import { putItem } from "../../lib/dynamoDb";

export const makeUpdateSearchObject = (
  client: Client,
  tableName: string
): UpdateSearchObjectFn => {
  return async (logger, searchObject) => {
    const result = await putItem(
      client,
      {
        TableName: tableName,
        Item: userItemToDocument(searchObject),
        ConditionExpression: "attribute_exists(pk)",
      },
      logger
    );

    if (isLeft(result)) {
      return result;
    }

    if (result.right === "CONDITION_CHECK_FAILED") {
      logger.error(`Trying to update searchObject that does not exist`, {
        searchObject,
      });
      return left("ERROR");
    }

    return right(searchObject);
  };
};
