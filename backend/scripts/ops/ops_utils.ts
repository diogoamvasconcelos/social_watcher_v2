import { DefaultOkReturn } from "@src/domain/ports/shared";
import { Logger } from "@src/lib/logger";
import DynamoDB, { DocumentClient, ScanInput } from "aws-sdk/clients/dynamodb";
import { getClient, Client } from "@src/lib/dynamoDb";
import { isLeft } from "fp-ts/lib/Either";
import { sleep } from "@test/lib/retry";

export type ApplyDdbItemFn = (
  logger: Logger,
  dynamoDBClient: Client,
  args: {
    tableName: string;
    tableKeySchema: DynamoDB.KeySchema;
    item: DocumentClient.AttributeMap;
  }
) => DefaultOkReturn;

export type ApplyDdbItemBatchFn = (
  logger: Logger,
  dynamoDBClient: Client,
  args: {
    tableName: string;
    tableKeySchema: DynamoDB.KeySchema;
    items: DocumentClient.AttributeMap[];
  }
) => DefaultOkReturn;

type ApplyToAllDdbItemsOptions = {
  // without throttling the DynamoDB consumed units can be quite high and that results in a single high cost for this operation
  throttling: "NONE" | "SOFT" | "HARD" | "SINGLE";
};

const throttlingConfig: Record<
  ApplyToAllDdbItemsOptions["throttling"],
  { scanLimit?: number; sleepBetweenScansMs?: number }
> = {
  NONE: {},
  SOFT: { scanLimit: 50, sleepBetweenScansMs: 250 },
  HARD: { scanLimit: 5, sleepBetweenScansMs: 1000 },
  SINGLE: { scanLimit: 1, sleepBetweenScansMs: 1000 },
};

export const applyToAllDdbItems = async (
  logger: Logger,
  tableName: string,
  {
    applyItemFn,
    applyItemBatchFn,
  }: {
    applyItemFn?: ApplyDdbItemFn;
    applyItemBatchFn?: ApplyDdbItemBatchFn;
  },
  { throttling }: ApplyToAllDdbItemsOptions = { throttling: "SOFT" }
) => {
  try {
    const region = process.env.AWS_REGION;
    if (!region) {
      throw new Error(`'AWS_REGION' environment variable needs to be set.`);
    }

    const dynamoDbUrl = process.env.DYNAMODB_URL;

    const ddb = new DynamoDB({ endpoint: dynamoDbUrl });
    const describeResult = await ddb
      .describeTable({ TableName: tableName })
      .promise();

    const tableKeySchema = describeResult.Table?.KeySchema;

    if (tableKeySchema == undefined) {
      logger.error("Empty the DynamoDB table schema", { tableName });
      throw new Error(`Empty the DynamoDB table schema:${tableName}`);
    }

    const dynamoDBClient = getClient(dynamoDbUrl);
    let cursor: DocumentClient.Key | undefined = undefined;
    let itemCount = 0;
    do {
      const params: ScanInput = {
        TableName: tableName,
        ExclusiveStartKey: cursor,
        Limit: throttlingConfig[throttling].scanLimit,
      };
      const scanResult = await dynamoDBClient.scan(params).promise();

      itemCount += scanResult.Count ?? 0;
      cursor = scanResult.LastEvaluatedKey;

      if (applyItemFn) {
        await Promise.all(
          (scanResult.Items ?? []).map(async (item) => {
            const applyResultEither = await applyItemFn(
              logger,
              dynamoDBClient,
              {
                tableName,
                tableKeySchema,
                item,
              }
            );
            if (isLeft(applyResultEither)) {
              logger.error("Failed to applyItemFn", { tableName, item });
              throw new Error("Failed calling applyItemFn");
            }
          })
        );
      }

      if (applyItemBatchFn) {
        const applyResultEither = await applyItemBatchFn(
          logger,
          dynamoDBClient,
          {
            tableName,
            tableKeySchema,
            items: scanResult.Items ?? [],
          }
        );
        if (isLeft(applyResultEither)) {
          logger.error("Failed to applyItemBatchFn", {
            tableName,
          });
          throw new Error("Failed calling applyItemBatchFn");
        }
      }

      logger.info(`Processing ${scanResult.Count}(${itemCount}) new items...`);

      const sleepTime = throttlingConfig[throttling].sleepBetweenScansMs;
      if (sleepTime) {
        await sleep(sleepTime);
      }
    } while (cursor);

    logger.info(
      `applyToAllDdbItems run on table ${tableName}: ${itemCount} items processed.`
    );
  } catch (error) {
    console.log(error);
    logger.error("Failed to applyToAllDdbItems", { tableName, error });
    throw new Error(`Failed to applyToAllDdbItems on table:${tableName}`);
  }
};
