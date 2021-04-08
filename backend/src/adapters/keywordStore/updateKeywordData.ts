import { isLeft, right, left } from "fp-ts/lib/Either";
import { UpdateKeywordDataFn } from "../../domain/ports/keywordStore/updateKeywordData";
import { putItem } from "../../lib/dynamoDb";
import { Client, keywordDataToDocument } from "./client";

export const makeUpdateKeywordData = (
  client: Client,
  tableName: string
): UpdateKeywordDataFn => {
  return async (logger, keywordData) => {
    const result = await putItem(
      client,
      {
        TableName: tableName,
        Item: keywordDataToDocument(keywordData),
      },
      logger
    );

    if (isLeft(result)) {
      return result;
    }
    const rightResult = result.right;
    if (rightResult === "CONDITION_CHECK_FAILED") {
      return left("ERROR");
    }
    return right(rightResult);
  };
};
