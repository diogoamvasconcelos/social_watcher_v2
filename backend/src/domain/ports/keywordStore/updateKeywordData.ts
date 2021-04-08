import { Logger } from "../../../lib/logger";
import { KeywordData } from "../../models/keyword";
import { DefaultOkReturn } from "../shared";

export type UpdateKeywordDataFn = (
  logger: Logger,
  keywordData: KeywordData
) => DefaultOkReturn;
