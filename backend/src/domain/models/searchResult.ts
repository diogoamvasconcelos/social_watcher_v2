import * as t from "io-ts";
import { DateFromISOStringV2 } from "../../lib/iots";
import { searchRecentResponseDataCodec } from "../../lib/twitter";
import { keywordCodec } from "./keyword";

export const searchResultMetadaCodec = t.type({
  id: t.string,
  keyword: keywordCodec,
  happenedAt: DateFromISOStringV2,
});

export const twitterSearchResultCodec = t.intersection([
  searchResultMetadaCodec,
  t.type({
    socialMedia: t.literal("twitter"),
    data: t.intersection([
      searchRecentResponseDataCodec,
      t.partial({ translatedText: t.string }),
    ]),
  }),
]);
export type TwitterSearchResult = t.TypeOf<typeof twitterSearchResultCodec>;

export const searchResultCodec = twitterSearchResultCodec;
export type SearchResult = t.TypeOf<typeof searchResultCodec>;
