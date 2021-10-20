import { GetResultTagsForUserFn } from "@src/domain/ports/userStore/getResultTagsForUser";
import { queryItems } from "@src/lib/dynamoDb";
import { Client, unknownToResultTag } from "./client";

export const makeGetResultTagsForUser = (
  client: Client,
  tableName: string
): GetResultTagsForUserFn => {
  return async (logger, id) => {
    return await queryItems(
      client,
      {
        TableName: tableName,
        KeyConditionExpression: "#pk = :pk AND begins_with(#sk, :skPrefix)",
        ExpressionAttributeNames: { "#pk": "pk", "#sk": "sk" },
        ExpressionAttributeValues: {
          ":pk": id,
          ":skPrefix": "resultTag#",
        },
      },
      unknownToResultTag,
      logger
    );
  };
};
