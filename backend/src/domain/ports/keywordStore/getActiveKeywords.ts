import { KeywordData } from "../../models/keyword";
import { SocialMedia } from "../../models/socialMedia";
import { CustomRightReturn } from "../shared";

export type GetActiveKeywordsFn = (
  socialMedia: SocialMedia
) => CustomRightReturn<KeywordData[]>;
