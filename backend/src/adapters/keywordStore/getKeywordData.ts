import { GetKeywordDataFn } from "../../domain/ports/keywordStore/getKeywordData";
import { getItem } from "../../lib/dynamoDb";
import { Client, toDocPrimaryKeys, unknownToKeywordData } from "./client";

export const makeGetKeywordData = (
  client: Client,
  tableName: string
): GetKeywordDataFn => {
  return async (logger, socialMedia, keyword) => {
    return await getItem(
      client,
      {
        TableName: tableName,
        Key: toDocPrimaryKeys({ socialMedia, keyword }),
      },
      unknownToKeywordData,
      logger
    );
  };
};
