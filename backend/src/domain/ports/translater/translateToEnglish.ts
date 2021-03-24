import { Logger } from "../../../lib/logger";
import { CustomRightReturn } from "../shared";

export type TranslateToEnglishFn = (
  logger: Logger,
  text: string,
  sourceLanguage: string
) => CustomRightReturn<string>;
