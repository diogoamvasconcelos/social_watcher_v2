import { dateISOString, lowerCase } from "@diogovasconcelos/lib/iots";
import * as t from "io-ts";
import { socialMediaCodec } from "./socialMedia";

export const keywordCodec = lowerCase;
export type Keyword = t.TypeOf<typeof keywordCodec>;

export const keywordStatusCodec = t.union([
  t.literal("INACTIVE"),
  t.literal("ACTIVE"),
]);
export type KeywordStatus = t.TypeOf<typeof keywordStatusCodec>;

export const keywordDataCodec = t.intersection([
  t.type({
    keyword: keywordCodec,
    status: keywordStatusCodec,
    socialMedia: socialMediaCodec,
  }),
  t.partial({
    searchedAt: dateISOString,
  }),
]);
export type KeywordData = t.TypeOf<typeof keywordDataCodec>;
