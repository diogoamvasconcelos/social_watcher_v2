import * as t from "io-ts";
import { lowerCase } from "../../lib/iots";
import { socialMediaCodec } from "./socialMedia";

export const keywordCodec = lowerCase;
export type Keyword = t.TypeOf<typeof keywordCodec>;

export const keywordStatusCodec = t.union([
  t.literal("DISABLED"),
  t.literal("ENABLED"),
]);
export type KeywordStatus = t.TypeOf<typeof keywordStatusCodec>;

export const keywordDataCodec = t.type({
  keyword: keywordCodec,
  status: keywordStatusCodec,
  socialMedia: socialMediaCodec,
});
export type KeywordData = t.TypeOf<typeof keywordDataCodec>;
