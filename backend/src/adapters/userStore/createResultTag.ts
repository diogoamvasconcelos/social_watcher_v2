import { isLeft, left, right } from "fp-ts/lib/Either";
import { Client, userItemToDocument } from "./client";
import { putItem } from "@src/lib/dynamoDb";
import { CreateResultTagFn } from "@src/domain/ports/userStore/createResultTag";

export const makeCreateResultTag = (
  client: Client,
  tableName: string
): CreateResultTagFn => {
  return async (logger, resultTag) => {
    const result = await putItem(
      client,
      {
        TableName: tableName,
        Item: userItemToDocument(resultTag),
        ConditionExpression: "attribute_not_exists(pk)",
      },
      logger
    );

    if (isLeft(result)) {
      return result;
    }

    if (result.right === "CONDITION_CHECK_FAILED") {
      logger.error(`Trying to create resultTag, but it already exists`, {
        resultTag,
      });
      return left("ERROR");
    }

    return right(resultTag);
  };
};
