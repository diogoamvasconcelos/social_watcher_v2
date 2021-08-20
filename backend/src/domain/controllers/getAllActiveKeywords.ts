import { isLeft, right, left } from "fp-ts/lib/Either";
import { socialMedias } from "../models/socialMedia";
import { Logger } from "../../lib/logger";
import { GetActiveKeywordsFn } from "../ports/keywordStore/getActiveKeywords";
import { Keyword } from "../models/keyword";
import { toSingleEither } from "@diogovasconcelos/lib/iots";
import { CustomRightReturn } from "../ports/shared";

type GetAllActiveKeywordsDeps = {
  logger: Logger;
  getActiveKeywordsFn: GetActiveKeywordsFn;
};

export const getAllActiveKeywords = async ({
  logger,
  getActiveKeywordsFn,
}: GetAllActiveKeywordsDeps): CustomRightReturn<Keyword[]> => {
  const activeKeywordsEither = toSingleEither(
    await Promise.all(
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
    )
  );
  if (isLeft(activeKeywordsEither)) {
    return left("ERROR");
  }

  // dedup
  let allActiveKeywordsSet = new Set<Keyword>();
  for (const keywordsData of activeKeywordsEither.right) {
    // union
    allActiveKeywordsSet = new Set([
      ...allActiveKeywordsSet,
      ...new Set(keywordsData.map((keywordData) => keywordData.keyword)),
    ]);
  }

  return right(Array.from(allActiveKeywordsSet.values()));
};
