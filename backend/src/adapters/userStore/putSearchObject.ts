import { isLeft, left, right } from "fp-ts/lib/Either";
import { putSearchObjectFn } from "../../domain/ports/userStore/putSearchObject";
import { Client, searchObjectToDocument } from "./client";
import { putItem } from "../../lib/dynamoDb";

export const makePutSearchObject = (
  client: Client,
  tableName: string
): putSearchObjectFn => {
  return async (logger, searchObject) => {
    const result = await putItem(
      client,
      {
        TableName: tableName,
        Item: searchObjectToDocument(searchObject),
      },
      logger
    );

    if (isLeft(result)) {
      return left("ERROR");
    }

    return right(searchObject);
  };
};
