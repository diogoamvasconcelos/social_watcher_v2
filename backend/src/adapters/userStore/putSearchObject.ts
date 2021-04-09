import { isLeft, left, right } from "fp-ts/lib/Either";
import { PutSearchObjectFn } from "../../domain/ports/userStore/putSearchObject";
import { Client, userItemToDocument } from "./client";
import { putItem } from "../../lib/dynamoDb";

export const makePutSearchObject = (
  client: Client,
  tableName: string
): PutSearchObjectFn => {
  return async (logger, searchObject) => {
    const result = await putItem(
      client,
      {
        TableName: tableName,
        Item: userItemToDocument(searchObject),
      },
      logger
    );

    if (isLeft(result)) {
      return left("ERROR");
    }

    return right(searchObject);
  };
};
