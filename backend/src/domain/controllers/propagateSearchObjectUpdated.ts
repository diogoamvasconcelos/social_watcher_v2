import { JsonObjectEncodable } from "@diogovasconcelos/lib/models/jsonEncodable";
import { isLeft, right } from "fp-ts/lib/Either";
import _ from "lodash";
import { Logger } from "@src/lib/logger";
import { KeywordData } from "@src/domain/models/keyword";
import { socialMedias } from "@src/domain/models/socialMedia";
import { SearchObjectDomain } from "@src/domain/models/userItem";
import { GetKeywordDataFn } from "@src/domain/ports/keywordStore/getKeywordData";
import { UpdateKeywordDataFn } from "@src/domain/ports/keywordStore/updateKeywordData";
import {
  DefaultOkReturn,
  eitherListToDefaultOk,
} from "@src/domain/ports/shared";
import { GetSearchObjectsForKeywordFn } from "@src/domain/ports/userStore/getSearchObjectsForKeyword";

export const propagateSearchObjectUpdated = async (
  {
    logger,
    getKeywordDataFn,
    updateKeywordDataFn,
    getSearchObjectsForKeywordFn,
  }: {
    logger: Logger;
    getKeywordDataFn: GetKeywordDataFn;
    updateKeywordDataFn: UpdateKeywordDataFn;
    getSearchObjectsForKeywordFn: GetSearchObjectsForKeywordFn;
  },
  searchObject: SearchObjectDomain,
  forceDeactivation: boolean = false
): DefaultOkReturn => {
  forceDeactivation ||= searchObject.lockedStatus === "LOCKED";

  const allSearchObjectsForKeywordEither = await getSearchObjectsForKeywordFn(
    logger,
    searchObject.keyword
  );
  if (isLeft(allSearchObjectsForKeywordEither)) {
    return allSearchObjectsForKeywordEither;
  }
  const allSearchObjectsForKeyword: SearchObjectDomain[] =
    allSearchObjectsForKeywordEither.right;

  const results = await Promise.all(
    socialMedias.map(async (socialMedia) => {
      const newKeywordStatus: KeywordData["status"] =
        forceDeactivation ||
        searchObject.searchData[socialMedia].enabledStatus === "DISABLED"
          ? "INACTIVE"
          : "ACTIVE";

      const keywordDataEither = await getKeywordDataFn(
        logger,
        socialMedia,
        searchObject.keyword
      );
      if (isLeft(keywordDataEither)) {
        return keywordDataEither;
      }

      logger.debug("controllers/onSearchObjectUpdated", {
        keywordDataEither: keywordDataEither as unknown as JsonObjectEncodable,
      });

      // Skip if already has the new status
      if (
        keywordDataEither.right !== "NOT_FOUND" &&
        keywordDataEither.right.status === newKeywordStatus
      ) {
        logger.info(
          `${socialMedia}: skipping as keyword is already ${newKeywordStatus}`
        );
        return right("OK");
      }

      // Deactivation special cases
      if (newKeywordStatus === "INACTIVE") {
        // Skip deactivation if doesn't exist
        if (keywordDataEither.right === "NOT_FOUND") {
          logger.info(
            `${socialMedia}: skipping deactivation as keyword doesn't exists`
          );
          return right("OK");
        }

        // Skip deactivation if being active by another user
        if (
          _.some(allSearchObjectsForKeyword, (searchObject) => {
            return (
              searchObject.lockedStatus === "UNLOCKED" &&
              searchObject.searchData[socialMedia].enabledStatus === "ENABLED"
            );
          })
        ) {
          logger.info(
            `${socialMedia}: skipping as keyword is being activated by another user's searchObject`
          );
          return right("OK");
        }
      }

      const updateResult = await updateKeywordDataFn(logger, {
        socialMedia,
        keyword: searchObject.keyword,
        status: newKeywordStatus,
      });
      logger.info(`${socialMedia}: updateKeyword completed with result.`, {
        updateKeywordResult: updateResult as unknown as JsonObjectEncodable,
      });

      return updateResult;
    })
  );

  return eitherListToDefaultOk(results);
};
