import * as t from "io-ts";
import { searchRecentResponseDataCodec } from "../../lib/twitter";
import { keywordCodec } from "./keyword";
import { DateFromISOString } from "io-ts-types/DateFromISOString";

export const searchResultMetadaCodec = t.type({
  id: t.string,
  keyword: keywordCodec,
  happened_at: DateFromISOString,
});

export const twitterSearchResultCodec = t.intersection([
  searchResultMetadaCodec,
  t.type({
    socialMedia: t.literal("twitter"),
    data: t.intersection([
      searchRecentResponseDataCodec,
      t.partial({ translatedText: t.string }), // can't use optional here because the type that is created doens't do the "?"
    ]),
  }),
]);
export type TwitterSearchResult = t.TypeOf<typeof twitterSearchResultCodec>;

export const searchResultCodec = twitterSearchResultCodec;
export type SearchResult = t.TypeOf<typeof searchResultCodec>;
