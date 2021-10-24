/* 
How to run:
- scripts/with_env.js yarn ts-node scripts/ops/clean_ddb_table.ts
*/

import { getConfig } from "@src/lib/config";
import { deleteItem } from "@src/lib/dynamoDb";
import { getLogger } from "@src/lib/logger";
import { DeleteItemInput } from "aws-sdk/clients/dynamodb";
import { ApplyDdbItemFn, applyToAllDdbItems } from "./ops_utils";

const logger = getLogger();
const config = getConfig();

const deleteItemFn: ApplyDdbItemFn = async (
  logger,
  dynamoDBClient,
  { tableName, tableKeySchema, item }
) => {
  const deleteParams: DeleteItemInput = {
    TableName: tableName,
    Key: tableKeySchema.reduce(
      (m, k) => ({
        ...m,
        [k.AttributeName]: item[k.AttributeName],
      }),
      {}
    ),
  };

  return deleteItem(dynamoDBClient, deleteParams, logger);
};

export const main = async () => {
  await Promise.all([
    // applyToAllDdbItems(logger, config.usersTableName, deleteItemFn),
    // applyToAllDdbItems(logger, config.keywordsTableName, deleteItemFn),
    applyToAllDdbItems(logger, config.searchResultsTableName, deleteItemFn),
  ]);
};

// void main();
