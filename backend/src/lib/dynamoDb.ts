import { DocumentClient, Put } from "aws-sdk/clients/dynamodb";
import { Either, right, left, isLeft } from "fp-ts/lib/Either";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { applyTransformToItem } from "./iots";

export const getClient = () => {
  return new DocumentClient();
};
export type Client = ReturnType<typeof getClient>;

export type PutParams = Put;

export const transactPutItems = async (
  client: Client,
  paramsList: NonEmptyArray<PutParams>
): Promise<Either<"ERROR", "OK" | "CONDITION_CHECK_FAILED">> => {
  try {
    const putParamsList: { ["Put"]: Put }[] = paramsList.map((params: Put) => ({
      Put: params,
    }));

    const params = { TransactItems: putParamsList };

    await client.transactWrite(params).promise();

    return right("OK");
  } catch (error) {
    if (error?.code === "TransactionCanceledException") {
      console.log(
        `Call to DynamoDB transactWrite with TransactionCanceledException. But that's OK`
      );
      return right("CONDITION_CHECK_FAILED");
    }

    console.error(
      "Call to DynamoDB get exited with following error:\n" +
        (error.message as string)
    );
    return left("ERROR");
  }
};

export const queryItems = async <T>(
  client: Client,
  params: DocumentClient.QueryInput,
  transformFn: (item: unknown) => Either<string[], T>
): Promise<Either<"ERROR", T[]>> => {
  try {
    let cursor: DocumentClient.Key | undefined = undefined;
    const items: unknown[] = [];

    do {
      const result: DocumentClient.QueryOutput = await client
        .query({ ...params, ExclusiveStartKey: cursor })
        .promise();

      items.push(...(result.Items ?? []));

      cursor = result.LastEvaluatedKey;
    } while (cursor);

    const transformedItems = [];

    for (const item of items) {
      const transformResult = applyTransformToItem(transformFn, item);
      if (isLeft(transformResult)) {
        return transformResult;
      }
      transformedItems.push(transformResult.right);
    }

    return right(transformedItems);
  } catch (error) {
    console.error(
      "Call to queryAlltItems exited with following error:\n" +
        (error.message as string)
    );
    return left("ERROR");
  }
};

export const putItem = async (
  client: Client,
  params: DocumentClient.PutItemInput
): Promise<Either<"ERROR", "OK" | "CONDITION_CHECK_FAILED">> => {
  try {
    await client.put(params).promise();
    return right("OK");
  } catch (error) {
    if (
      error instanceof Error &&
      error.message == "The conditional request failed"
    ) {
      return right("CONDITION_CHECK_FAILED");
    }

    console.error(
      "Call to DynamoDB get exited with following error:\n" +
        (error.message as string)
    );
    return left("ERROR");
  }
};

export const putItemBatch = async (client: Client) => {
  const res = client.batchWrite();
};

export const scanItems = async (
  client: Client,
  params: DocumentClient.ScanInput
) => {
  try {
    const scanResult: DocumentClient.QueryOutput = await client
      .scan(params)
      .promise();
    return scanResult;
  } catch (e) {
    console.error(`Call to DynamoDB scan exited with error`);
    throw e;
  }
};

export const getItem = async <T>(
  client: Client,
  params: DocumentClient.GetItemInput,
  transformFn: (item: unknown) => Either<string[], T>
): Promise<Either<"ERROR", "NOT_FOUND" | T>> => {
  try {
    const getResult = await client.get(params).promise();
    if (!getResult.Item) {
      return right("NOT_FOUND");
    }

    return applyTransformToItem(transformFn, getResult.Item);
  } catch (error) {
    console.error(
      "Call to DynamoDB get exited with following error:\n" +
        (error.message as string)
    );
    return left("ERROR");
  }
};

export const deleteItem = async (
  client: Client,
  params: DocumentClient.DeleteItemInput
) => {
  try {
    const result = await client.delete(params).promise();
    return result;
  } catch (e) {
    console.error("Call to DynamoDB delete exited with error");
    throw e;
  }
};
