import { putItem } from "@src/lib/dynamoDb";
import { Client, userItemToDocument } from "./client";
import { isLeft, left, right } from "fp-ts/lib/Either";
import { PutPaymentDataFn } from "@src/domain/ports/userStore/putPaymentData";

export const makePutPaymentData = (
  client: Client,
  tableName: string
): PutPaymentDataFn => {
  return async (logger, paymentData) => {
    const result = await putItem(
      client,
      {
        TableName: tableName,
        Item: userItemToDocument(paymentData),
      },
      logger
    );

    if (isLeft(result)) {
      return left("ERROR");
    }

    return right("OK");
  };
};
