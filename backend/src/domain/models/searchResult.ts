import * as t from "io-ts";
import { keywordCodec } from "./keyword";
import { dateISOString } from "@diogovasconcelos/lib";
import { searchRecentResponseDataCodec } from "../../lib/twitter/client";

export const searchResultMetadaCodec = t.type({
  id: t.string,
  keyword: keywordCodec,
  happenedAt: dateISOString,
  link: t.string,
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
