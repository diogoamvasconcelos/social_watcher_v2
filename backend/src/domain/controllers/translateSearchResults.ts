import { isLeft } from "fp-ts/lib/Either";
import { deepmergeSafe } from "@diogovasconcelos/lib";
import { Logger } from "../../lib/logger";
import { SearchResult } from "../models/searchResult";
import { TranslateToEnglishFn } from "../ports/translater/translateToEnglish";
import { throwUnexpectedCase } from "../../lib/runtime";
import { PartialDeep } from "type-fest";

export const translateSearchResults = async <T extends SearchResult>(
  {
    translateToEnglishFn,
    logger,
  }: { translateToEnglishFn: TranslateToEnglishFn; logger: Logger },
  results: T[]
): Promise<T[]> => {
  const getText = (item: SearchResult) => {
    switch (item.socialMedia) {
      case "twitter": {
        return item.data.text;
      }
      case "reddit":
        return item.data.selftext;
      default:
        return throwUnexpectedCase(item, "translateSearchResults");
    }
  };

  return await Promise.all(
    results.map(async (result) => {
      const text = getText(result);
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
