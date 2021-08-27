import { right } from "fp-ts/lib/Either";
import { TranslateToEnglishFn } from "@src/domain/ports/translater/translateToEnglish";
import { translateText } from "@src/lib/translate";
import { Client } from "./client";

const languageMap: Record<string, string> = { in: "id" };
const unsupportedLanguages = ["und"];

export const makeTranslateToEnglish = (
  client: Client
): TranslateToEnglishFn => {
  return async (logger, text, sourceLanguage) => {
    if (
      sourceLanguage === undefined ||
      unsupportedLanguages.includes(sourceLanguage)
    ) {
      sourceLanguage = "auto";
    }

    if (languageMap[sourceLanguage]) {
      sourceLanguage = languageMap[sourceLanguage];
    }

    if (sourceLanguage == "en") {
      return right({ text, lang: sourceLanguage });
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
