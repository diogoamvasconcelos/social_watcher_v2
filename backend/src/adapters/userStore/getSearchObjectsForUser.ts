import { GetSearchObjectsForUserFn } from "../../domain/ports/userStore/getSearchObjectsForUser";
import { queryItems } from "../../lib/dynamoDb";
import { Client, unknownToSearchObject } from "./client";

export const makeGetSearchObjectsForUser = (
  client: Client,
  tableName: string
): GetSearchObjectsForUserFn => {
  return async (logger, id) => {
    return await queryItems(
      client,
      {
        TableName: tableName,
        KeyConditionExpression: "#pk = :pk AND begins_with(#sk, :skPrefix)",
        ExpressionAttributeNames: { "#pk": "pk", "#sk": "sk" },
        ExpressionAttributeValues: {
          ":pk": id,
          ":skPrefix": "keyword#",
        },
      },
      unknownToSearchObject,
      logger
    );
  };
};
