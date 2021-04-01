import { DocumentClient, Put } from "aws-sdk/clients/dynamodb";
import { Either, right, left, isLeft } from "fp-ts/lib/Either";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { applyTransformToItem } from "./iots";
import { Logger } from "./logger";

export const getClient = (endpoint: string | undefined = undefined) => {
  return new DocumentClient({ endpoint });
};
export type Client = ReturnType<typeof getClient>;

export type PutParams = Put;

export const transactPutItems = async (
  client: Client,
  paramsList: NonEmptyArray<PutParams>,
  logger: Logger
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
      logger.info(
        `Call to DynamoDB transactWrite with TransactionCanceledException. But that's OK`
      );
      return right("CONDITION_CHECK_FAILED");
    }

    logger.error(
      "Call to DynamoDB get exited with following error:\n" +
        (error.message as string)
    );
    return left("ERROR");
  }
};

export const queryItems = async <T>(
  client: Client,
  params: DocumentClient.QueryInput,
  transformFn: (item: unknown) => Either<string[], T>,
  logger: Logger
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
      const transformResult = applyTransformToItem(transformFn, item, logger);
      if (isLeft(transformResult)) {
        return transformResult;
      }
      transformedItems.push(transformResult.right);
    }

    return right(transformedItems);
  } catch (error) {
    logger.error(
      "Call to queryAlltItems exited with following error:\n" +
        (error.message as string)
    );
    return left("ERROR");
  }
};

export const putItem = async (
  client: Client,
  params: DocumentClient.PutItemInput,
  logger: Logger
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

    logger.error(
      "Call to DynamoDB get exited with following error:\n" +
        (error.message as string)
    );
    return left("ERROR");
  }
};

export const scanItems = async (
  client: Client,
  params: DocumentClient.ScanInput,
  logger: Logger
) => {
  try {
    const scanResult: DocumentClient.QueryOutput = await client
      .scan(params)
      .promise();
    return right(scanResult);
  } catch (error) {
    logger.error(
      "Call to DynamoDB scan exited with following error:\n" +
        (error.message as string)
    );
    return left("ERROR");
  }
};

export const getItem = async <T>(
  client: Client,
  params: DocumentClient.GetItemInput,
  transformFn: (item: unknown) => Either<string[], T>,
  logger: Logger
): Promise<Either<"ERROR", "NOT_FOUND" | T>> => {
  try {
    const getResult = await client.get(params).promise();
    if (!getResult.Item) {
      return right("NOT_FOUND");
    }

    return applyTransformToItem(transformFn, getResult.Item, logger);
  } catch (error) {
    logger.error(
      "Call to DynamoDB get exited with following error:\n" +
        (error.message as string)
    );
    return left("ERROR");
  }
};

export const deleteItem = async (
  client: Client,
  params: DocumentClient.DeleteItemInput,
  logger: Logger
) => {
  try {
    const result = await client.delete(params).promise();
    return right(result);
  } catch (e) {
    logger.error("Call to DynamoDB delete exited with error");
    return left("ERROR");
  }
};
