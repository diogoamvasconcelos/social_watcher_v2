import {
  Client,
  toPaymentDataDocumentKeys,
  unknownToPaymentData,
} from "./client";
import { getItem } from "@src/lib/dynamoDb";
import { GetPaymentDataFn } from "@src/domain/ports/userStore/getPaymentData";

export const makeGetPaymentData = (
  client: Client,
  tableName: string
): GetPaymentDataFn => {
  return async (logger, id) => {
    return await getItem(
      client,
      {
        TableName: tableName,
        Key: toPaymentDataDocumentKeys({ id }),
        ConsistentRead: true,
      },
      unknownToPaymentData,
      logger
    );
  };
};
