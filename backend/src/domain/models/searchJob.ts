import * as t from "io-ts";
import { keywordCodec } from "./keyword";

const searchJobBaseCodec = t.type({
  keyword: keywordCodec,
});
export type SearchJobBase = t.TypeOf<typeof searchJobBaseCodec>;

export const twitterSearchJobCodec = t.intersection([
  searchJobBaseCodec,
  t.type({
    socialMedia: t.literal("twitter"),
  }),
]);
export type TwitterSearchJob = t.TypeOf<typeof twitterSearchJobCodec>;

export const searchJobCodec = twitterSearchJobCodec; // t.intersection([twitterSearchJobCodec]);
export type SearchJob = t.TypeOf<typeof searchJobCodec>;
