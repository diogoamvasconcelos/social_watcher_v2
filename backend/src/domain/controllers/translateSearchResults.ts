import { isLeft } from "fp-ts/lib/Either";
import { Logger } from "@src/lib/logger";
import { SearchResult } from "@src/domain/models/searchResult";
import { TranslateToEnglishFn } from "@src/domain/ports/translater/translateToEnglish";
import { PartialDeep } from "type-fest";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { getSearchResultText } from "../utils/searchResultUtils";

export const translateSearchResults = async <T extends SearchResult>(
  {
    translateToEnglishFn,
    logger,
  }: { translateToEnglishFn: TranslateToEnglishFn; logger: Logger },
  results: T[]
): Promise<T[]> => {
  return await Promise.all(
    results.map(async (result) => {
      const text = getSearchResultText(result);
      const translateResult = await translateToEnglishFn(
        logger,
        text,
        result.data.lang
      );
      if (isLeft(translateResult)) {
        logger.info(`Failed to translate(${result.data.lang}): ${text}`);
        return result;
      }
      return deepmergeSafe(result, {
        data: {
          translatedText: translateResult.right.text,
          lang: translateResult.right.lang,
        },
      } as PartialDeep<T>); // ugly one
    })
  );
};
