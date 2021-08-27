import { Logger } from "@src/lib/logger";
import { CustomRightReturn } from "@src/domain/ports/shared";

export type TranslateToEnglishFn = (
  logger: Logger,
  text: string,
  sourceLanguage?: string
) => CustomRightReturn<{ text: string; lang: string }>;
