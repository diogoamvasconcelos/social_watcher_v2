import { DynamoDBStreamEvent } from "aws-lambda";
import { Either, left, right } from "fp-ts/lib/Either";
import { makeGetKeywordData } from "../../adapters/keywordStore/getKeywordData";
import { unknownToUserItem } from "../../adapters/userStore/client";
import {
  SearchObjectDomain,
  UserData,
  UserItemDomain,
} from "../../domain/models/userItem";
import { fromEither } from "@diogovasconcelos/lib";
import { getConfig } from "../../lib/config";
import { getLogger, Logger } from "../../lib/logger";
import { JsonObjectEncodable } from "@diogovasconcelos/lib";
import { throwUnexpectedCase } from "../../lib/runtime";
import { defaultMiddlewareStack } from "../middlewares/common";
import { getClient as getKeywordStoreClient } from "../../adapters/keywordStore/client";
import { getClient as getUserStoreClient } from "../../adapters/userStore/client";
import { makeUpdateKeywordData } from "../../adapters/keywordStore/updateKeywordData";
import { makeGetSearchObjectsForKeyword } from "../../adapters/userStore/getSearchObjectsForKeyword";
import { GetKeywordDataFn } from "../../domain/ports/keywordStore/getKeywordData";
import { UpdateKeywordDataFn } from "../../domain/ports/keywordStore/updateKeywordData";
import { GetSearchObjectsForKeywordFn } from "../../domain/ports/userStore/getSearchObjectsForKeyword";
import { Converter } from "aws-sdk/clients/dynamodb";
import { propagateSearchObjectUpdated } from "../../domain/controllers/propagateSearchObjectUpdated";
import { eitherListToDefaultOk } from "../../domain/ports/shared";
import { propagateUserDataChanged } from "../../domain/controllers/propagateUserDataChanged";
import { GetSearchObjectsForUserFn } from "../../domain/ports/userStore/getSearchObjectsForUser";
import { PutSearchObjectFn } from "../../domain/ports/userStore/putSearchObject";
import { makeGetSearchObjectsForUser } from "../../adapters/userStore/getSearchObjectsForUser";
import { makePutSearchObject } from "../../adapters/userStore/putSearchObject";

const config = getConfig();
const logger = getLogger();

export const handler = async (event: DynamoDBStreamEvent) => {
  const keywordStoreClient = getKeywordStoreClient();
  const userStoreClient = getUserStoreClient();
  const deps = {
    logger,
    getKeywordDataFn: makeGetKeywordData(
      keywordStoreClient,
      config.keywordsTableName
    ),
    updateKeywordDataFn: makeUpdateKeywordData(
      keywordStoreClient,
      config.keywordsTableName
    ),
    getSearchObjectsForKeywordFn: makeGetSearchObjectsForKeyword(
      userStoreClient,
      config.usersTableName
    ),
    getSearchObjectsForUserFn: makeGetSearchObjectsForUser(
      userStoreClient,
      config.usersTableName
    ),
    putSearchObjectFn: makePutSearchObject(
      userStoreClient,
      config.usersTableName
    ),
  };

  const results = await Promise.all(
    event.Records.map(async (record) => {
      if (!record.eventName) {
        logger.error("Missing eventName in record", {
          record: record as JsonObjectEncodable,
        });
        return left("ERROR");
      }

      const oldImageDoc = Converter.unmarshall(record.dynamodb?.OldImage ?? {});
      const newImageDoc = Converter.unmarshall(record.dynamodb?.NewImage ?? {});

      switch (record.eventName) {
        case "INSERT": {
          const newItem = fromEither(unknownToUserItem(newImageDoc));

          return newItem.type === "USER_DATA"
            ? handleUserData(deps, {
                eventName: record.eventName,
                newItem,
              })
            : newItem.type === "SEARCH_OBJECT"
            ? handleSearchObject(deps, {
                eventName: record.eventName,
                newItem,
              })
            : // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            newItem.type === "PAYMENT_DATA"
            ? right("OK") // skip
            : throwUnexpectedCase({} as never, "handlers/usersStreamConsumers");
        }

        case "MODIFY": {
          const oldItem = fromEither(unknownToUserItem(oldImageDoc));
          const newItem = fromEither(unknownToUserItem(newImageDoc));

          return newItem.type === "USER_DATA" && oldItem.type === "USER_DATA"
            ? handleUserData(deps, {
                eventName: record.eventName,
                oldItem,
                newItem,
              })
            : newItem.type === "SEARCH_OBJECT" &&
              oldItem.type === "SEARCH_OBJECT"
            ? handleSearchObject(deps, {
                eventName: record.eventName,
                oldItem,
                newItem,
              })
            : newItem.type === "PAYMENT_DATA" && oldItem.type === "PAYMENT_DATA"
            ? right("OK") // skip
            : throwUnexpectedCase({} as never, "handlers/usersStreamConsumers");
        }
        case "REMOVE": {
          const oldItem = fromEither(unknownToUserItem(oldImageDoc));

          return oldItem.type === "USER_DATA"
            ? handleUserData(deps, {
                eventName: record.eventName,
                oldItem,
              })
            : oldItem.type === "SEARCH_OBJECT"
            ? handleSearchObject(deps, {
                eventName: record.eventName,
                oldItem,
              })
            : // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            oldItem.type === "PAYMENT_DATA"
            ? right("OK") // skip
            : throwUnexpectedCase({} as never, "handlers/usersStreamConsumers");
        }
      }
    })
  );

  fromEither(await eitherListToDefaultOk(results));
};

export const lambdaHandler = defaultMiddlewareStack(handler);

type UserItemRecordData<T extends UserItemDomain> =
  | { eventName: "INSERT"; newItem: T }
  | { eventName: "MODIFY"; oldItem: T; newItem: T }
  | { eventName: "REMOVE"; oldItem: T };

type HandleUserItem<T extends UserItemDomain> = (
  deps: {
    logger: Logger;
    getKeywordDataFn: GetKeywordDataFn;
    updateKeywordDataFn: UpdateKeywordDataFn;
    getSearchObjectsForKeywordFn: GetSearchObjectsForKeywordFn;
    getSearchObjectsForUserFn: GetSearchObjectsForUserFn;
    putSearchObjectFn: PutSearchObjectFn;
  },
  recordData: UserItemRecordData<T>
) => Promise<Either<"ERROR", "OK">>;

const handleUserData: HandleUserItem<UserData> = async (deps, recordData) => {
  switch (recordData.eventName) {
    case "MODIFY": {
      if (
        recordData.oldItem.subscription.nofSearchObjects !=
        recordData.newItem.subscription.nofSearchObjects
      ) {
        return await propagateUserDataChanged(deps, recordData.newItem);
      }
      break;
    }
    default:
      break;
  }

  return right("OK");
};

const handleSearchObject: HandleUserItem<SearchObjectDomain> = async (
  deps,
  recordData
) => {
  switch (recordData.eventName) {
    case "INSERT": {
      return await propagateSearchObjectUpdated(deps, recordData.newItem);
    }

    case "MODIFY": {
      if (recordData.oldItem.keyword != recordData.newItem.keyword) {
        const results = await Promise.all([
          propagateSearchObjectUpdated(deps, recordData.oldItem, true),
          propagateSearchObjectUpdated(deps, recordData.newItem),
        ]);

        return eitherListToDefaultOk(results);
      } else {
        await propagateSearchObjectUpdated(deps, recordData.newItem);
      }
      break;
    }

    case "REMOVE": {
      return await propagateSearchObjectUpdated(deps, recordData.oldItem, true);
    }
  }

  return right("OK");
};
