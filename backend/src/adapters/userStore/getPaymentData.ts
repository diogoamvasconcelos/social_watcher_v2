import {
  Client,
  toPaymentDataDocumentKeys,
  unknownToPaymentData,
} from "./client";
import { getItem } from "../../lib/dynamoDb";
import { GetPaymentDataFn } from "../../domain/ports/userStore/getPaymentData";

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
