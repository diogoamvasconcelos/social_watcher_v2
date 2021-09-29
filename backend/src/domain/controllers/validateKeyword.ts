import { Either, left, right } from "fp-ts/lib/Either";
import { Keyword } from "../models/keyword";

export const keywordLimits = {
  length: 40,
  words: 3,
};

export type ValidateKeywordErrors =
  | "TOO_MANY_WORDS"
  | "STARTS_WITH_SPACE"
  | "ENDS_WITH_SPACE"
  | "TOO_LONG";

export const validateKeyword = (
  keyword: Keyword
): Either<ValidateKeywordErrors, "OK"> => {
  // real restrictions:
  // - instagram hastags can't have spaces, only characters, numbers and underscore

  const space = " ";
  // imposed restrictions:
  // - only 2 spaces
  if (keyword.split(space).length > keywordLimits.words) {
    return left("TOO_MANY_WORDS");
  }
  // - can't start with space
  if (keyword.startsWith(space)) {
    return left("STARTS_WITH_SPACE");
  }
  // - can't end with a space
  if (keyword.endsWith(space)) {
    return left("ENDS_WITH_SPACE");
  }
  // - max 40 chars long
  if (keyword.length > keywordLimits.length) {
    return left("TOO_LONG");
  }

  return right("OK");
};
