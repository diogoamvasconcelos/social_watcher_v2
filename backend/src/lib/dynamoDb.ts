import { DocumentClient, Put } from "aws-sdk/clients/dynamodb";
import { Either, right, left, isLeft } from "fp-ts/lib/Either";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";

export function getClient() {
  return new DocumentClient();
}

export type PutParams = Put;

export async function transactPutItems(
  client: DocumentClient,
  paramsList: NonEmptyArray<PutParams>
): Promise<Either<"ERROR", "OK" | "CONDITION_CHECK_FAILED">> {
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
}

export async function queryItems<T>(
  client: DocumentClient,
  params: DocumentClient.QueryInput,
  transformFn: (item: unknown) => Either<string[], T>
): Promise<Either<"ERROR", T[]>> {
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
      const transformResult = applyTransform(transformFn, item);
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
}

export async function putItem(
  client: DocumentClient,
  params: DocumentClient.PutItemInput
): Promise<Either<"ERROR", "OK" | "CONDITION_CHECK_FAILED">> {
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
}

export async function scanItems(
  client: DocumentClient,
  params: DocumentClient.ScanInput
) {
  try {
    const scanResult: DocumentClient.QueryOutput = await client
      .scan(params)
      .promise();
    return scanResult;
  } catch (e) {
    console.error(`Call to DynamoDB scan exited with error`);
    throw e;
  }
}

export async function getItem<T>(
  client: DocumentClient,
  params: DocumentClient.GetItemInput,
  transformFn: (item: unknown) => Either<string[], T>
): Promise<Either<"ERROR", "NOT_FOUND" | T>> {
  try {
    const getResult = await client.get(params).promise();
    if (!getResult.Item) {
      return right("NOT_FOUND");
    }

    return applyTransform(transformFn, getResult.Item);
  } catch (error) {
    console.error(
      "Call to DynamoDB get exited with following error:\n" +
        (error.message as string)
    );
    return left("ERROR");
  }
}

export async function deleteItem(
  client: DocumentClient,
  params: DocumentClient.DeleteItemInput
) {
  try {
    const result = await client.delete(params).promise();
    return result;
  } catch (e) {
    console.error("Call to DynamoDB delete exited with error");
    throw e;
  }
}

function applyTransform<T>(
  transformFn: (item: unknown) => Either<string[], T>,
  item: unknown
): Either<"ERROR", T> {
  const transformResult = transformFn(item);

  if (isLeft(transformResult)) {
    console.error(
      "Unable to transform DynamoDB item.\n" +
        "Item:\n" +
        JSON.stringify(item) +
        "Errors:\n" +
        JSON.stringify(transformResult.left)
    );
    return left("ERROR");
  }
  return transformResult;
}
