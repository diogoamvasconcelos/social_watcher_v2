import { CustomRightReturn } from "../shared";

export type TranslateToEnglishFn = (
  text: string,
  sourceLanguage: string
) => CustomRightReturn<string>;
