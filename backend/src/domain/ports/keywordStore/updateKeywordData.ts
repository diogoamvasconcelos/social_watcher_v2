import { Logger } from "@src/lib/logger";
import { KeywordData } from "@src/domain/models/keyword";
import { DefaultOkReturn } from "@src/domain/ports/shared";

export type UpdateKeywordDataFn = (
  logger: Logger,
  keywordData: KeywordData
) => DefaultOkReturn;
