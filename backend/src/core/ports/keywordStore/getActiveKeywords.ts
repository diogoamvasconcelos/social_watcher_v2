import { Either } from "fp-ts/lib/Either";
import { KeywordData } from "../../models/keyword";
import { SocialMedia } from "../../models/socialMedia";

export type GetActiveKeywordsFn = (
  socialMedia: SocialMedia
) => Promise<Either<"ERROR", KeywordData[]>>;
