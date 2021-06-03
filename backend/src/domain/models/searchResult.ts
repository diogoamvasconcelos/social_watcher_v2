import * as t from "io-ts";
import { keywordCodec } from "./keyword";
import { dateISOString } from "@diogovasconcelos/lib";
import { searchRecentResponseItemCodec as twitterSearchItemCodec } from "../../lib/twitter/models";
import { searchListingItemCodec as redditSearchItemCodec } from "../../lib/reddit/models";

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
      twitterSearchItemCodec,
      t.partial({ translatedText: t.string }),
    ]),
  }),
]);
export type TwitterSearchResult = t.TypeOf<typeof twitterSearchResultCodec>;

export const redditSearchResultCodec = t.intersection([
  searchResultMetadaCodec,
  t.type({
    socialMedia: t.literal("reddit"),
    data: t.intersection([
      redditSearchItemCodec,
      t.partial({ translatedText: t.string, lang: t.string }),
    ]),
  }),
]);
export type RedditSearchResult = t.TypeOf<typeof redditSearchResultCodec>;

export const searchResultCodec = t.union([
  twitterSearchResultCodec,
  redditSearchResultCodec,
]);
export type SearchResult = t.TypeOf<typeof searchResultCodec>;
