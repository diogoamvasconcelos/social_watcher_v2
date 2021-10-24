/* 
how to run:
scripts/with_env.js 'yarn ts-node -r tsconfig-paths/register scripts/ops/patches/add_hackernews_fuzzymatch' --env dev
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
  HackernewsSearchResult,
  hackernewsSearchResultCodec,
} from "@src/domain/models/searchResult";
import { decode, fromEither } from "@diogovasconcelos/lib";

const hackernewsResultWithOptionaFuzzyMatchCodec = t.union([
  hackernewsSearchResultCodec,
  t.type({ data: t.type({ fuzzyMatch: t.undefined }) }),
]);
type HackernewsResultWithOutFuzzyMatch = Omit<
  HackernewsSearchResult,
  "fuzzyMatch"
>;

const addHackernewsFuzzyMatchFn: ApplyDdbItemFn = async (
  logger,
  dynamoDBClient,
  { tableName, item }
) => {
  if (item.socialMedia !== "hackernews") {
    // skip non-hackernews
    return right("OK");
  }

  const decodedHackernewsSearchResult = fromEither(
    decode(hackernewsResultWithOptionaFuzzyMatchCodec, item)
  );

  if (decodedHackernewsSearchResult.data.fuzzyMatch != undefined) {
    // no need to patch, skip
    return right("OK");
  }
  const hackernewsSearchResult =
    decodedHackernewsSearchResult as unknown as HackernewsResultWithOutFuzzyMatch; // ugly

  const updateParams: DocumentClient.UpdateItemInput = {
    TableName: tableName,
    Key: searchResultToPrimaryKey(hackernewsSearchResult.id),
    UpdateExpression: "SET #d.#fm = :fm",
    ConditionExpression:
      "attribute_exists(pk) AND attribute_not_exists(#d.#fm)",
    ExpressionAttributeNames: { "#d": "data", "#fm": "fuzzyMatch" },
    ExpressionAttributeValues: { ":fm": true }, // hardcode to "true" as they used to be all fuzzyMatch searches
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
    addHackernewsFuzzyMatchFn,
    { throttling: "SOFT" }
  );
};

// void main();
