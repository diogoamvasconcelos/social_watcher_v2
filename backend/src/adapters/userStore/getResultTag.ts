import { GetResultTagFn } from "@src/domain/ports/userStore/getResultTag";
import { getItem } from "@src/lib/dynamoDb";
import { Client, toResultTagDocumentKeys, unknownToResultTag } from "./client";

export const makeGetResultTag = (
  client: Client,
  tableName: string
): GetResultTagFn => {
  return async (logger, id, tagId) => {
    return await getItem(
      client,
      {
        TableName: tableName,
        Key: toResultTagDocumentKeys({ id, tagId }),
      },
      unknownToResultTag,
      logger
    );
  };
};
