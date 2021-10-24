/* 
How to run:
scripts/with_env.js 'yarn ts-node --files -r tsconfig-paths/register scripts/ops/patches/add_local_id_to_results' --env dev
*/

import * as t from "io-ts";
import {
  searchResultToPrimaryKey,
  unknownToSearchResult,
} from "@src/adapters/searchResultsStore/client";
import { getConfig } from "@src/lib/config";
import { updateItem } from "@src/lib/dynamoDb";
import { getLogger } from "@src/lib/logger";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { isLeft, left, right } from "fp-ts/lib/Either";
import { ApplyDdbItemFn, applyToAllDdbItems } from "../ops_utils";
import {
  SearchResult,
  searchResultCodec,
  toUniqueId,
} from "@src/domain/models/searchResult";
import { decode, fromEither } from "@diogovasconcelos/lib";

const searchResultWithOptionaLocalIdCodec = t.union([
  searchResultCodec,
  t.type({ localId: t.undefined }),
]);
type SearchResultWithoutLocalId = Omit<SearchResult, "localId">;

const addLocalIdFn: ApplyDdbItemFn = async (
  logger,
  dynamoDBClient,
  { tableName, item }
) => {
  if (item.socialMedia === "hackernews") {
    // temporary skip hackernews
    return right("OK");
  }

  const decodedSearchResult = fromEither(
    decode(searchResultWithOptionaLocalIdCodec, item)
  );

  if (decodedSearchResult.localId != undefined) {
    // no need to patch, skip
    return right("OK");
  }
  const searchResult =
    decodedSearchResult as unknown as SearchResultWithoutLocalId; // ugly

  const localId = searchResult.id;
  const uniqueId = toUniqueId({
    socialMedia: searchResult.socialMedia,
    localId,
  });

  const updateParams: DocumentClient.UpdateItemInput = {
    TableName: tableName,
    Key: searchResultToPrimaryKey(uniqueId),
    UpdateExpression: "SET #li = :li, #id = :id",
    ConditionExpression: "attribute_exists(#id) AND attribute_not_exists(#li)",
    ExpressionAttributeNames: { "#li": "localId", "#id": "id" },
    ExpressionAttributeValues: { ":li": localId, ":id": uniqueId },
    ReturnValues: "ALL_NEW",
  };

  const updateResultEither = await updateItem(
    dynamoDBClient,
    updateParams,
    unknownToSearchResult,
    {},
    logger
  );

  if (isLeft(updateResultEither)) {
    return updateResultEither;
  }
  if (
    updateResultEither.right === "CONDITION_CHECK_FAILED" ||
    updateResultEither.right === "ATTRIBUTE_DOES_NOT_EXIST"
  ) {
    logger.error("addLocalIdFn failed to update item", {
      item,
      result: updateResultEither.right,
    });
    return left("ERROR");
  }

  return right("OK");
};

export const main = async () => {
  const logger = getLogger();
  const config = getConfig();

  await applyToAllDdbItems(
    logger,
    config.searchResultsTableName,
    { applyItemFn: addLocalIdFn },
    { throttling: "SOFT" }
  );
};

// void main();
