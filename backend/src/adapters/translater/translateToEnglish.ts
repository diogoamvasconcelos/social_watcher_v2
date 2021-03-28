import { right } from "fp-ts/lib/Either";
import { TranslateToEnglishFn } from "../../domain/ports/translater/translateToEnglish";
import { translateText } from "../../lib/translate";
import { Client } from "./client";

const languageMap: Record<string, string> = { in: "id" };
const unsupportedLanguages = ["und"];

export const makeTranslateToEnglish = (
  client: Client
): TranslateToEnglishFn => {
  return async (logger, text, sourceLanguage) => {
    if (languageMap[sourceLanguage]) {
      sourceLanguage = languageMap[sourceLanguage];
    }

    if (
      sourceLanguage == "en" ||
      unsupportedLanguages.includes(sourceLanguage)
    ) {
      return right(text);
    }

    return await translateText(
      client,
      {
        SourceLanguageCode: sourceLanguage,
        TargetLanguageCode: "en",
        Text: text,
      },
      logger
    );
  };
};
