import deepmerge from "deepmerge";
import { isLeft } from "fp-ts/lib/Either";
import { Logger } from "../../lib/logger";
import { TwitterSearchResult } from "../models/searchResult";
import { TranslateToEnglishFn } from "../ports/translater/translateToEnglish";

export const translateTwitterSearchResults = async (
  {
    translateToEnglishFn,
    logger,
  }: { translateToEnglishFn: TranslateToEnglishFn; logger: Logger },
  results: TwitterSearchResult[]
): Promise<TwitterSearchResult[]> => {
  return await Promise.all(
    results.map(async (result) => {
      const translateResult = await translateToEnglishFn(
        logger,
        result.data.text,
        result.data.lang
      );
      if (isLeft(translateResult)) {
        logger.info(
          `Failed to translate(${result.data.lang}): ${result.data.text}`
        );
        return result;
      }
      return deepmerge(result, {
        data: { translatedText: translateResult.right },
      });
    })
  );
};
