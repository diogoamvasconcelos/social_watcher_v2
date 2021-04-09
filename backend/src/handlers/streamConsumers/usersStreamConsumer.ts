import { DynamoDBStreamEvent } from "aws-lambda";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { makeGetKeywordData } from "../../adapters/keywordStore/getKeywordData";
import { unknownToUserItem } from "../../adapters/userStore/client";
import { activateSearchObject } from "../../domain/controllers/activateSearchObject";
import { SearchObject, UserData, UserItem } from "../../domain/models/userItem";
import { fromEither } from "../../lib/iots";
import { getConfig } from "../../lib/config";
import { getLogger, Logger } from "../../lib/logger";
import { JsonObjectEncodable } from "../../lib/models/jsonEncodable";
import { throwUnexpectedCase } from "../../lib/runtime";
import { defaultMiddlewareStack } from "../middlewares/common";
import { getClient as getKeywordStoreClient } from "../../adapters/keywordStore/client";
import { getClient as getUserStoreClient } from "../../adapters/userStore/client";
import { makeUpdateKeywordData } from "../../adapters/keywordStore/updateKeywordData";
import { makeGetSearchObjectsForKeyword } from "../../adapters/userStore/getSearchObjectsForKeyword";
import { GetKeywordDataFn } from "../../domain/ports/keywordStore/getKeywordData";
import { UpdateKeywordDataFn } from "../../domain/ports/keywordStore/updateKeywordData";
import { GetSearchObjectsForKeywordFn } from "../../domain/ports/userStore/getSearchObjectsForKeyword";
import { deactivateSearchObject } from "../../domain/controllers/deactivateSearchObject";
import _ from "lodash";
import { Converter } from "aws-sdk/clients/dynamodb";

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
            : // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            newItem.type === "SEARCH_OBJECT"
            ? handleSearchObject(deps, {
                eventName: record.eventName,
                newItem,
              })
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
            : throwUnexpectedCase({} as never, "handlers/usersStreamConsumers");
        }
        case "REMOVE": {
          const oldItem = fromEither(unknownToUserItem(oldImageDoc));

          return oldItem.type === "USER_DATA"
            ? handleUserData(deps, {
                eventName: record.eventName,
                oldItem,
              })
            : // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            oldItem.type === "SEARCH_OBJECT"
            ? handleSearchObject(deps, {
                eventName: record.eventName,
                oldItem,
              })
            : throwUnexpectedCase({} as never, "handlers/usersStreamConsumers");
        }
      }
    })
  );

  if (_.some(results, (result) => isLeft(result))) {
    return left("ERROR");
  }
  return right("OK");
};

export const lambdaHandler = defaultMiddlewareStack(handler);

type UserItemRecordData<T extends UserItem> =
  | { eventName: "INSERT"; newItem: T }
  | { eventName: "MODIFY"; oldItem: T; newItem: T }
  | { eventName: "REMOVE"; oldItem: T };

type HandleUserItem<T extends UserItem> = (
  deps: {
    logger: Logger;
    getKeywordDataFn: GetKeywordDataFn;
    updateKeywordDataFn: UpdateKeywordDataFn;
    getSearchObjectsForKeywordFn: GetSearchObjectsForKeywordFn;
  },
  recordData: UserItemRecordData<T>
) => Promise<Either<"ERROR", "OK">>;

const handleUserData: HandleUserItem<UserData> = async (logger, recordData) => {
  switch (recordData.eventName) {
    case "MODIFY": {
      if (
        recordData.oldItem.nofSearchObjects !=
        recordData.newItem.nofSearchObjects
      ) {
        // await applyNofSearchObjectsChange(logger, recordData.newItem);
        return right("OK");
      }
      break;
    }
    default:
      break;
  }

  return right("OK");
};

const handleSearchObject: HandleUserItem<SearchObject> = async (
  {
    logger,
    getKeywordDataFn,
    updateKeywordDataFn,
    getSearchObjectsForKeywordFn,
  },
  recordData
) => {
  switch (recordData.eventName) {
    case "INSERT": {
      if (recordData.newItem.lockedStatus === "UNLOCKED") {
        return await activateSearchObject(
          { logger, getKeywordDataFn, updateKeywordDataFn },
          recordData.newItem
        );
      }
      break;
    }
    case "MODIFY": {
      if (recordData.oldItem.lockedStatus != recordData.newItem.lockedStatus) {
        switch (recordData.newItem.lockedStatus) {
          case "UNLOCKED":
            return await activateSearchObject(
              {
                logger,
                getKeywordDataFn,
                updateKeywordDataFn,
              },
              recordData.oldItem
            );
          case "LOCKED":
            return await deactivateSearchObject(
              {
                logger,
                getKeywordDataFn,
                updateKeywordDataFn,
                getSearchObjectsForKeywordFn,
              },
              recordData.oldItem,
              false
            );
        }
      }
      break;
    }
    case "REMOVE": {
      if (recordData.oldItem.lockedStatus === "UNLOCKED") {
        return await deactivateSearchObject(
          {
            logger,
            getKeywordDataFn,
            updateKeywordDataFn,
            getSearchObjectsForKeywordFn,
          },
          recordData.oldItem,
          true
        );
      }
    }
  }

  return right("OK");
};
