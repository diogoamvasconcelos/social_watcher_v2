import { Logger } from "../../../lib/logger";
import { Keyword, KeywordData } from "../../models/keyword";
import { SocialMedia } from "../../models/socialMedia";
import { CustomRightReturn } from "../shared";

export type GetKeywordDataFn = (
  logger: Logger,
  socialMedia: SocialMedia,
  keyword: Keyword
) => CustomRightReturn<KeywordData | "NOT_FOUND">;
