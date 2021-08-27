import {
  Client,
  toSearchObjectDocumentPartitionKeys,
  userItemToDocument,
} from "./client";
import { MoveSearchObjectFn } from "@src/domain/ports/userStore/moveSearchObject";
import { isLeft, left, right } from "fp-ts/lib/Either";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { deleteItem, transactWriteItems } from "@src/lib/dynamoDb";

export const makeMoveSearchObject = (
  client: Client,
  tableName: string
): MoveSearchObjectFn => {
  return async (
    logger,
    { originalSearchObject, newIndex, newLockedStatus }
  ) => {
    // check if moving to the same index => just delete (can't have more than one op per item on a transaction)
    if (originalSearchObject.index == newIndex) {
      return await deleteItem(
        client,
        {
          TableName: tableName,
          Key: toSearchObjectDocumentPartitionKeys(originalSearchObject),
        },
        logger
      );
    }

    // otherwise, put and delete using a transaction
    const putItemInNewIndexOp: DocumentClient.TransactWriteItem = {
      Put: {
        TableName: tableName,
        Item: userItemToDocument({
          ...originalSearchObject,
          index: newIndex,
          lockedStatus: newLockedStatus,
        }),
        ConditionExpression: "attribute_exists(pk)",
      },
    };
    const deleteOriginalItemOp: DocumentClient.TransactWriteItem = {
      Delete: {
        TableName: tableName,
        Key: toSearchObjectDocumentPartitionKeys(originalSearchObject),
        ConditionExpression: "attribute_exists(pk)",
      },
    };

    const result = await transactWriteItems(
      client,
      [putItemInNewIndexOp, deleteOriginalItemOp],
      logger
    );
    if (isLeft(result)) {
      return result;
    }

    if (result.right === "CONDITION_CHECK_FAILED") {
      logger.error(`Condition failed for the put and delete transaction`, {
        originalSearchObject,
        newIndex,
      });
      return left("ERROR");
    }

    return right("OK");
  };
};
