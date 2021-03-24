import { right } from "fp-ts/lib/Either";
import { TranslateToEnglishFn } from "../../domain/ports/translater/translateToEnglish";
import { translateText } from "../../lib/translate";
import { Client } from "./client";

export const makeTranslateToEnglish = (
  client: Client
): TranslateToEnglishFn => {
  return async (text: string, sourceLanguage: string) => {
    if (sourceLanguage == "en") {
      return right(text);
    }

    return await translateText(client, {
      SourceLanguageCode: sourceLanguage,
      TargetLanguageCode: "en",
      Text: text,
    });
  };
};
