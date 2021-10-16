import { PutUserFn } from "@src/domain/ports/userStore/putUser";
import { Client, userItemToDocument } from "./client";
import { putItem } from "@src/lib/dynamoDb";
import { isLeft, left, right } from "fp-ts/lib/Either";

export const makePutUser = (
  client: Client,
  tableName: string,
  options?: { allowOverwrite: boolean }
): PutUserFn => {
  return async (logger, user) => {
    const result = await putItem(
      client,
      {
        TableName: tableName,
        Item: userItemToDocument({ ...user, type: "USER_DATA" }),
        ConditionExpression: options?.allowOverwrite
          ? undefined
          : "attribute_not_exists(pk)",
      },
      logger
    );

    if (isLeft(result)) {
      return left("ERROR");
    }

    if (result.right == "CONDITION_CHECK_FAILED") {
      logger.error("Failed to add user to db: User already exists", { user });
      return left("ERROR");
    }

    return right("OK");
  };
};
