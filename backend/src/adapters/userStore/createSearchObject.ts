import { isLeft, left, right } from "fp-ts/lib/Either";
import { CreateSearchObjectFn } from "../../domain/ports/userStore/createSearchObject";
import { Client, userItemToDocument } from "./client";
import { putItem } from "../../lib/dynamoDb";

export const makeCreateSearchObject = (
  client: Client,
  tableName: string
): CreateSearchObjectFn => {
  return async (logger, searchObject) => {
    const result = await putItem(
      client,
      {
        TableName: tableName,
        Item: userItemToDocument(searchObject),
        ConditionExpression: "attribute_not_exists(pk)",
      },
      logger
    );

    if (isLeft(result)) {
      return left("ERROR");
    }

    return right(searchObject);
  };
};
