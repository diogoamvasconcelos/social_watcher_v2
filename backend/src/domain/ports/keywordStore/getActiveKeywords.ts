import { Logger } from "../../../lib/logger";
import { KeywordData } from "../../models/keyword";
import { SocialMedia } from "../../models/socialMedia";
import { CustomRightReturn } from "../shared";

export type GetActiveKeywordsFn = (
  logger: Logger,
  socialMedia: SocialMedia
) => CustomRightReturn<KeywordData[]>;
