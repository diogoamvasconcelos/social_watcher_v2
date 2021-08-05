import * as t from "io-ts";
import { keywordCodec } from "./keyword";
import { searchRecentResponseItemCodec as twitterSearchItemCodec } from "../../lib/twitter/models";
import { searchListingItemCodec as redditSearchItemCodec } from "../../lib/reddit/models";
import { dateISOString, numberFromStringy } from "@diogovasconcelos/lib/iots";

export const searchResultMetadaCodec = t.type({
  id: t.string,
  keyword: keywordCodec,
  happenedAt: dateISOString,
  link: t.string,
});

const searchResultDataBaseCodec = t.partial({
  translatedText: t.string,
  lang: t.string,
});

// +++++++++++
// + Twitter +
// +++++++++++
export const twitterSearchResultCodec = t.intersection([
  searchResultMetadaCodec,
  t.type({
    socialMedia: t.literal("twitter"),
    data: t.intersection([searchResultDataBaseCodec, twitterSearchItemCodec]),
  }),
]);
export type TwitterSearchResult = t.TypeOf<typeof twitterSearchResultCodec>;

// ++++++++++
// + Reddit +
// ++++++++++
export const redditSearchResultCodec = t.intersection([
  searchResultMetadaCodec,
  t.type({
    socialMedia: t.literal("reddit"),
    data: t.intersection([searchResultDataBaseCodec, redditSearchItemCodec]),
  }),
]);
export type RedditSearchResult = t.TypeOf<typeof redditSearchResultCodec>;

// ++++++++++++++
// + Hackernews +
// ++++++++++++++
export const hackernewsSearchResultCodec = t.intersection([
  searchResultMetadaCodec,
  t.type({
    socialMedia: t.literal("hackernews"),
    data: t.intersection([
      searchResultDataBaseCodec,
      t.type({
        text: t.string,
        author: t.string,
        objectId: t.string,
        storyLink: t.string,
        numComments: t.number,
      }),
      t.partial({
        storyId: t.string,
      }),
    ]),
  }),
]);
export type HackernewsSearchResult = t.TypeOf<
  typeof hackernewsSearchResultCodec
>;

// +++++++++++++
// + Instagram +
// +++++++++++++
export const instagramSearchResultCodec = t.intersection([
  searchResultMetadaCodec,
  t.type({
    socialMedia: t.literal("instagram"),
    data: t.intersection([
      searchResultDataBaseCodec,
      t.type({
        id: t.string,
        caption: t.string,
        owner: t.string,
        shortcode: t.string,
        display_url: t.string,
        num_comments: t.number,
        num_likes: t.number,
        is_video: t.boolean,
      }),
      t.partial({
        num_video_views: t.number,
      }),
    ]),
  }),
]);
export type InstagramSearchResult = t.TypeOf<typeof instagramSearchResultCodec>;

// +++++++++++
// + Youtube +
// +++++++++++

export const youtubeSearchResultCodec = t.intersection([
  searchResultMetadaCodec,
  t.type({
    socialMedia: t.literal("youtube"),
    data: t.intersection([
      searchResultDataBaseCodec,
      t.type({
        id: t.string,
        title: t.string,
        description: t.string,
        thumbnailUrl: t.string,
        viewCount: numberFromStringy,
        likeCount: numberFromStringy,
        dislikeCount: numberFromStringy,
        favoriteCount: numberFromStringy,
        commentCount: numberFromStringy,
        durationInSeconds: t.number,
      }),
    ]),
  }),
]);
export type YoutubeSearchResult = t.TypeOf<typeof youtubeSearchResultCodec>;

// ++++++++++++++++
// + SearchResult +
// ++++++++++++++++
export const searchResultCodec = t.union([
  twitterSearchResultCodec,
  redditSearchResultCodec,
  hackernewsSearchResultCodec,
  instagramSearchResultCodec,
  youtubeSearchResultCodec,
]);
export type SearchResult = t.TypeOf<typeof searchResultCodec>;
