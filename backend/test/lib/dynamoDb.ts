import DynamoDB from "aws-sdk/clients/dynamodb";
import { getClient as getDynamoDBClient } from "@src/lib/dynamoDb";
import { getLocalTestConfig } from "./config";

const endpoint = getLocalTestConfig().dynamoDbUrl;
const dynamoDb = new DynamoDB({ endpoint });
export const client = getDynamoDBClient(endpoint);

const tableExists = async (tableName: string) => {
  try {
    const listTablesResult = await dynamoDb.listTables({}).promise();
    return listTablesResult.TableNames?.includes(tableName) ?? false;
  } catch (e) {
    throw new Error(e);
  }
};

const prepareTable = async (
  tableName: string,
  params: AWS.DynamoDB.CreateTableInput
) => {
  if (await tableExists(tableName)) {
    await deleteTable(tableName);
  }

  try {
    await dynamoDb.createTable(params).promise();
  } catch (e) {
    throw new Error(e);
  }
};

export const preparesGenericTable = async (tableName: string) => {
  const params = {
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" },
      { AttributeName: "gsi1pk", AttributeType: "S" },
      { AttributeName: "gsi1sk", AttributeType: "S" },
    ],
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "gsi1",
        KeySchema: [
          { AttributeName: "gsi1pk", KeyType: "HASH" },
          { AttributeName: "gsi1sk", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
    TableName: tableName,
  };

  await prepareTable(tableName, params);
};

export const deleteTable = async (tableName: string) => {
  if (await tableExists(tableName)) {
    try {
      return await dynamoDb.deleteTable({ TableName: tableName }).promise();
    } catch (e) {
      throw new Error(e);
    }
  }

  return null;
};
