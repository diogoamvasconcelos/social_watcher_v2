import { Either, isLeft, right } from "fp-ts/lib/Either";
import { socialMedias } from "../models/socialMedia";
import { Logger } from "../../lib/logger";
import { GetActiveKeywordsFn } from "../ports/keywordStore/getActiveKeywords";
import { Keyword } from "../models/keyword";

type GetAllActiveKeywordsDeps = {
  logger: Logger;
  getActiveKeywordsFn: GetActiveKeywordsFn;
};

export const getAllActiveKeywords = async ({
  logger,
  getActiveKeywordsFn,
}: GetAllActiveKeywordsDeps): Promise<Either<"ERROR", Keyword[]>> => {
  const activeKeywordsEither = await Promise.all(
    socialMedias.map(async (socialMedia) => {
      const activeKeywordsResult = await getActiveKeywordsFn(
        logger,
        socialMedia
      );
      if (isLeft(activeKeywordsResult)) {
        logger.error("Failed to getActiveKeywords", {
          error: activeKeywordsResult.left,
          socialMedia,
        });
      }

      return activeKeywordsResult;
    })
  );

  // dedup
  let allActiveKeywordsSet = new Set<Keyword>();
  for (const keywordsEither of activeKeywordsEither) {
    if (isLeft(keywordsEither)) {
      return keywordsEither;
    }

    // union
    allActiveKeywordsSet = new Set([
      ...allActiveKeywordsSet,
      ...new Set(
        keywordsEither.right.map((keywordData) => keywordData.keyword)
      ),
    ]);
  }

  return right(Array.from(allActiveKeywordsSet.values()));
};
