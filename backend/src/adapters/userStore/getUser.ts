import { Client, toUserDataDocumentKeys, unknownToUser } from "./client";
import { getItem } from "@src/lib/dynamoDb";
import { GetUserFn } from "@src/domain/ports/userStore/getUser";

export const makeGetUser = (client: Client, tableName: string): GetUserFn => {
  return async (logger, id) => {
    return await getItem(
      client,
      {
        TableName: tableName,
        Key: toUserDataDocumentKeys({ id }),
        ConsistentRead: true,
      },
      unknownToUser,
      logger
    );
  };
};
