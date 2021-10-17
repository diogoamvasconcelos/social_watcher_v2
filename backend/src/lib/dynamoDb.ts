import {
  JsonEncodable,
  JsonObjectEncodable,
} from "@diogovasconcelos/lib/models/jsonEncodable";
import { DocumentClient, TransactWriteItem } from "aws-sdk/clients/dynamodb";
import { Either, right, left, isLeft } from "fp-ts/lib/Either";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import _ from "lodash";
import { applyTransformToItem } from "./iots";
import { Logger } from "./logger";

export const getClient = (endpoint?: string) => {
  return new DocumentClient({ endpoint });
};
export type Client = ReturnType<typeof getClient>;

const convertDateFieldsToISO = (
  obj: JsonObjectEncodable
): JsonObjectEncodable => {
  const convertFields = (input: JsonEncodable): JsonEncodable => {
    switch (typeof input) {
      case "object": {
        if (input instanceof Date) {
          return (input as Date).toISOString();
        } else if (Array.isArray(input)) {
          return input.map(convertFields);
        } else if (input != null) {
          return _.mapValues(input, convertFields);
        }
        return input;
      }
      default:
        return input;
    }
  };

  return _.mapValues(obj, convertFields);
};

export const transactWriteItems = async (
  client: Client,
  paramsList: NonEmptyArray<TransactWriteItem>,
  logger: Logger
): Promise<Either<"ERROR", "OK" | "CONDITION_CHECK_FAILED">> => {
  try {
    const params: DocumentClient.TransactWriteItemsInput = {
      TransactItems: paramsList,
    };

    await client.transactWrite(params).promise();

    return right("OK");
  } catch (error) {
    if (error?.code === "TransactionCanceledException") {
      logger.info(
        `Call to DynamoDB transactWrite with TransactionCanceledException. But that's OK`
      );
      return right("CONDITION_CHECK_FAILED");
    }

    logger.error("Call to DynamoDB transactWrite exited with following error", {
      error,
    });
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
    let cursor: DocumentClient.Key | undefined;
    let items: unknown[] = [];

    do {
      const result: DocumentClient.QueryOutput = await client
        .query({ ...params, ExclusiveStartKey: cursor })
        .promise();

      items = items.concat(result.Items ?? []);

      cursor = result.LastEvaluatedKey;
    } while (cursor);

    const transformedItems: T[] = [];
    for (const item of items) {
      const transformResult = applyTransformToItem(transformFn, item, logger);
      if (isLeft(transformResult)) {
        return transformResult;
      }
      transformedItems.push(transformResult.right);
    }

    return right(transformedItems);
  } catch (error) {
    logger.error("Call to queryAlltItems exited with following error", {
      error,
    });
    return left("ERROR");
  }
};

export const putItem = async (
  client: Client,
  params: DocumentClient.PutItemInput,
  logger: Logger
): Promise<Either<"ERROR", "OK" | "CONDITION_CHECK_FAILED">> => {
  try {
    const supportedParams: DocumentClient.PutItemInput = {
      ...params,
      Item: convertDateFieldsToISO(params.Item),
    };
    await client.put(supportedParams).promise();
    return right("OK");
  } catch (error) {
    if (
      error instanceof Error &&
      error.message == "The conditional request failed"
    ) {
      return right("CONDITION_CHECK_FAILED");
    }

    logger.error("Call to DynamoDB put exited with following error", { error });
    return left("ERROR");
  }
};

export const scanItems = async <T>(
  client: Client,
  params: DocumentClient.ScanInput,
  transformFn: (item: unknown) => Either<string[], T>,
  logger: Logger
) => {
  try {
    const scanResult: DocumentClient.QueryOutput = await client
      .scan(params)
      .promise();

    const transformedItems: T[] = [];
    for (const item of scanResult.Items ?? []) {
      const transformResult = applyTransformToItem(transformFn, item, logger);
      if (isLeft(transformResult)) {
        return transformResult;
      }
      transformedItems.push(transformResult.right);
    }

    return right(transformedItems);
  } catch (error) {
    logger.error("Call to DynamoDB scan exited with following error", {
      error,
    });
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
    logger.error("Call to DynamoDB get exited with following error", { error });
    return left("ERROR");
  }
};

export const deleteItem = async (
  client: Client,
  params: DocumentClient.DeleteItemInput,
  logger: Logger
): Promise<Either<"ERROR", "OK">> => {
  try {
    const deleteResult = await client.delete(params).promise();
    logger.debug("Delete item result", { result: deleteResult });
    return right("OK");
  } catch (error) {
    logger.error("Call to DynamoDB delete exited with error", { error });
    return left("ERROR");
  }
};

type UpdateItemOptions = {
  allowAttributeDoesntExist?: boolean;
};
export const updateItem = async <T>(
  client: Client,
  params: DocumentClient.UpdateItemInput,
  transformFn: (item: unknown) => Either<string[], T>,
  options: UpdateItemOptions,
  logger: Logger
): Promise<
  Either<"ERROR", T | "CONDITION_CHECK_FAILED" | "ATTRIBUTE_DOES_NOT_EXIST">
> => {
  try {
    const updateResult = await client.update(params).promise();
    return applyTransformToItem(transformFn, updateResult.Attributes, logger);
  } catch (error) {
    if (error instanceof Error) {
      // Filter "allowed errors"
      switch (error.message) {
        case "The conditional request failed":
          return right("CONDITION_CHECK_FAILED");
        case "The provided expression refers to an attribute that does not exist in the item": {
          if (options.allowAttributeDoesntExist) {
            return right("ATTRIBUTE_DOES_NOT_EXIST");
          }
        }
      }
    }

    logger.error("Call to DynamoDB update exited with following error", {
      error,
    });
    return left("ERROR");
  }
};
