import { Client, toUserDocKeys, unknownToUser } from "./client";
import { getItem } from "../../lib/dynamoDb";
import { GetUserFn } from "../../domain/ports/userStore/getUser";

export const makeGetUser = (client: Client, tableName: string): GetUserFn => {
  return async (logger, id) => {
    return await getItem(
      client,
      { TableName: tableName, Key: toUserDocKeys({ id }) },
      unknownToUser,
      logger
    );
  };
};
