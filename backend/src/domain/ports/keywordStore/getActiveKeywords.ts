import { Logger } from "@src/lib/logger";
import { KeywordData } from "@src/domain/models/keyword";
import { SocialMedia } from "@src/domain/models/socialMedia";
import { CustomRightReturn } from "@src/domain/ports/shared";

export type GetActiveKeywordsFn = (
  logger: Logger,
  socialMedia: SocialMedia
) => CustomRightReturn<KeywordData[]>;
