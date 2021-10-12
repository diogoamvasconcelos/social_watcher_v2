import { Client, toResultTagDocumentKeys } from "./client";
import { DeleteResultTagFn } from "@src/domain/ports/userStore/deleteResultTag";
import { deleteItem } from "@src/lib/dynamoDb";

export const makeDeleteResultTag = (
  client: Client,
  tableName: string
): DeleteResultTagFn => {
  return async (logger, resultTagIds) => {
    return await deleteItem(
      client,
      {
        TableName: tableName,
        Key: toResultTagDocumentKeys(resultTagIds),
        ConditionExpression: "attribute_exists(pk)",
      },
      logger
    );
  };
};
