import { isLeft, left, right } from "fp-ts/lib/Either";
import _ from "lodash";
import { Logger } from "../../lib/logger";
import { JsonObjectEncodable } from "../../lib/models/jsonEncodable";
import { socialMedias } from "../models/socialMedia";
import { SearchObject } from "../models/userItem";
import { GetKeywordDataFn } from "../ports/keywordStore/getKeywordData";
import { UpdateKeywordDataFn } from "../ports/keywordStore/updateKeywordData";
import { DefaultOkReturn } from "../ports/shared";
import { GetSearchObjectsForKeywordFn } from "../ports/userStore/getSearchObjectsForKeyword";

export const deactivateSearchObject = async (
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
  searchObject: SearchObject,
  force: Boolean
): DefaultOkReturn => {
  logger.info("controllers/deactivateSearchObject", { searchObject });

  const allSearchObjectsForKeywordEither = await getSearchObjectsForKeywordFn(
    logger,
    searchObject.keyword
  );
  if (isLeft(allSearchObjectsForKeywordEither)) {
    return allSearchObjectsForKeywordEither;
  }
  const allSearchObjectsForKeyword: SearchObject[] =
    allSearchObjectsForKeywordEither.right;

  const results = await Promise.all(
    socialMedias.map(async (socialMedia) => {
      if (!force && searchObject.searchData[socialMedia].enabledStatus) {
        logger.info(
          `${socialMedia}: skipping as searchObject socialMedia config is enabled`
        );
        return right("OK");
      }

      const keywordDataEither = await getKeywordDataFn(
        logger,
        socialMedia,
        searchObject.keyword
      );
      if (isLeft(keywordDataEither)) {
        return keywordDataEither;
      }

      if (
        keywordDataEither.right === "NOT_FOUND" ||
        keywordDataEither.right.status === "INACTIVE"
      ) {
        logger.info(`${socialMedia}: skipping as keyword is already inactive`);
        return right("OK");
      }

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

      const updateResult = await updateKeywordDataFn(logger, {
        socialMedia,
        keyword: searchObject.keyword,
        status: "INACTIVE",
      });
      logger.info(`${socialMedia}: updateKeyword completed with result.`, {
        updateKeywordResult: (updateResult as unknown) as JsonObjectEncodable,
      });

      return updateResult;
    })
  );

  if (_.some(results, (result) => isLeft(result))) {
    return left("ERROR");
  }
  return right("OK");
};
