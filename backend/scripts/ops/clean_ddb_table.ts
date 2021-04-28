/* 
How to run:
- scripts/with_env.js yarn ts-node scripts/ops/clean_ddb_table.ts
*/

import AWS from "aws-sdk";
import {
  DeleteItemInput,
  DocumentClient,
  ScanInput,
} from "aws-sdk/clients/dynamodb";

const printObjectBlock = (label: string, obj: Object) => {
  console.log("================");
  console.log(label);
  console.log(obj);
};

const cleanTable = async (tableName: string, verbose: boolean = false) => {
  const region = process.env.AWS_REGION;
  if (!region) {
    throw new Error(`'AWS_REGION' environment variable needs to be set.`);
  }

  let tableKeySchema: AWS.DynamoDB.KeySchema | undefined = undefined;
  try {
    const ddb = new AWS.DynamoDB();
    const describeResult = await ddb
      .describeTable({ TableName: tableName })
      .promise();

    tableKeySchema = describeResult.Table?.KeySchema;

    if (verbose) {
      printObjectBlock(
        `DynamoDB table (${tableName}) key schema:`,
        tableKeySchema ?? {}
      );
    }
  } catch (e) {
    throw new Error(
      `Failed to describe the DynamoDB table:${tableName}.\nError:${e}`
    );
  }

  const dynamoDBClient = new AWS.DynamoDB.DocumentClient();
  let cursor: DocumentClient.Key | undefined = undefined;
  let itemCount = 0;
  do {
    try {
      const params: ScanInput = {
        TableName: tableName,
        ExclusiveStartKey: cursor,
      };
      const scanResult = await dynamoDBClient.scan(params).promise();

      if (verbose) {
        printObjectBlock(`DynamoDB table (${tableName}) scan result:`, {
          ...scanResult,
          Items: "...",
        });
      }

      itemCount += scanResult.Count ?? 0;
      cursor = scanResult.LastEvaluatedKey;

      console.log(`Deleting ${scanResult.Count} items...`);

      await Promise.all(
        (scanResult.Items ?? []).map(async (item) => {
          try {
            const deleteParams: DeleteItemInput = {
              TableName: tableName,
              Key:
                tableKeySchema?.reduce(
                  (m, k) => ({
                    ...m,
                    [k.AttributeName]: item[k.AttributeName],
                  }),
                  {}
                ) ?? {},
            };

            await dynamoDBClient.delete(deleteParams).promise();
          } catch (e) {
            throw new Error(
              `Failed to delete an item from the DynamoDB table:${tableName}.\nError:${e}`
            );
          }
        })
      );
    } catch (e) {
      throw new Error(
        `Failed to scan the DynamoDB table:${tableName}.\nError:${e}`
      );
    }
  } while (cursor);

  console.log(
    `DynamoDB table (${tableName}) has been successfully cleaned up: ${itemCount} deleted items.`
  );
};

const main = async () => {
  await Promise.all([
    //cleanTable(process.env.USERS_TABLE_NAME ?? ""),
    //cleanTable(process.env.KEYWORDS_TABLE_NAME ?? ""),
    cleanTable(process.env.SEARCH_RESULTS_TABLE_NAME ?? ""),
  ]);
};

void main();
