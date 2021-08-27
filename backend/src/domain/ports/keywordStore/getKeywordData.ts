import { Logger } from "@src/lib/logger";
import { Keyword, KeywordData } from "@src/domain/models/keyword";
import { SocialMedia } from "@src/domain/models/socialMedia";
import { CustomRightReturn } from "@src/domain/ports/shared";

export type GetKeywordDataFn = (
  logger: Logger,
  socialMedia: SocialMedia,
  keyword: Keyword
) => CustomRightReturn<KeywordData | "NOT_FOUND">;
