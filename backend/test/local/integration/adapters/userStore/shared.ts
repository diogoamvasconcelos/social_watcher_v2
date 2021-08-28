import { client } from "@test/lib/dynamoDb";
import { putItem } from "@src/lib/dynamoDb";
import { userItemToDocument } from "@src/adapters/userStore/client";
import { UserItemDomain } from "@src/domain/models/userItem";
import { Logger } from "@src/lib/logger";

export const directlyPutUserItemInTable = async (
  logger: Logger,
  { tableName, userItem }: { tableName: string; userItem: UserItemDomain }
) => {
  return await putItem(
    client,
    {
      TableName: tableName,
      Item: userItemToDocument(userItem),
    },
    logger
  );
};
