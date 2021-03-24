import deepmerge from "deepmerge";
import { isLeft } from "fp-ts/lib/Either";
import { TwitterSearchResult } from "../models/searchResult";
import { TranslateToEnglishFn } from "../ports/translater/translateToEnglish";

export const translateTwitterSearchResults = async (
  translateToEnglishFn: TranslateToEnglishFn,
  results: TwitterSearchResult[]
): Promise<TwitterSearchResult[]> => {
  return await Promise.all(
    results.map(async (result) => {
      const translateResult = await translateToEnglishFn(
        result.data.text,
        result.data.lang
      );
      if (isLeft(translateResult)) {
        console.log(
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
