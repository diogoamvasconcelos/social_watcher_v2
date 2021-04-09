import { isLeft, left, right } from "fp-ts/lib/Either";
import _ from "lodash";
import { Logger } from "../../lib/logger";
import { JsonObjectEncodable } from "../../lib/models/jsonEncodable";
import { socialMedias } from "../models/socialMedia";
import { SearchObject } from "../models/userItem";
import { GetKeywordDataFn } from "../ports/keywordStore/getKeywordData";
import { UpdateKeywordDataFn } from "../ports/keywordStore/updateKeywordData";
import { DefaultOkReturn } from "../ports/shared";

export const activateSearchObject = async (
  {
    logger,
    getKeywordDataFn,
    updateKeywordDataFn,
  }: {
    logger: Logger;
    getKeywordDataFn: GetKeywordDataFn;
    updateKeywordDataFn: UpdateKeywordDataFn;
  },
  searchObject: SearchObject
): DefaultOkReturn => {
  logger.info("controllers/activateSearchObject", { searchObject });

  const results = await Promise.all(
    socialMedias.map(async (socialMedia) => {
      if (searchObject.searchData[socialMedia].enabledStatus === "DISABLED") {
        logger.info(
          `${socialMedia}: skipping as searchObject socialMedia config is disabled`
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

      logger.debug("controllers/activateSearchObject", {
        keywordDataEither: (keywordDataEither as unknown) as JsonObjectEncodable,
      });

      if (
        keywordDataEither.right !== "NOT_FOUND" &&
        keywordDataEither.right.status === "ACTIVE"
      ) {
        logger.info(`${socialMedia}: skipping as keyword is already active`);
        return right("OK");
      }

      const updateResult = await updateKeywordDataFn(logger, {
        socialMedia,
        keyword: searchObject.keyword,
        status: "ACTIVE",
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
