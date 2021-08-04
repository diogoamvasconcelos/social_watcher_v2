import * as t from "io-ts";
import { keywordCodec } from "./keyword";

const searchJobBaseCodec = t.type({
  keyword: keywordCodec,
});
export type SearchJobBase = t.TypeOf<typeof searchJobBaseCodec>;

// +++++++++++
// + Twitter +
// +++++++++++
export const twitterSearchJobCodec = t.intersection([
  searchJobBaseCodec,
  t.type({
    socialMedia: t.literal("twitter"),
  }),
]);
export type TwitterSearchJob = t.TypeOf<typeof twitterSearchJobCodec>;

// ++++++++++
// + Reddit +
// ++++++++++
export const redditSearchJobCodec = t.intersection([
  searchJobBaseCodec,
  t.type({
    socialMedia: t.literal("reddit"),
  }),
]);
export type RedditSearchJob = t.TypeOf<typeof redditSearchJobCodec>;

// ++++++++++++++
// + Hackernews +
// ++++++++++++++
export const hackernewsSearchJobCodec = t.intersection([
  searchJobBaseCodec,
  t.type({
    socialMedia: t.literal("hackernews"),
  }),
]);
export type HackernewsSearchJob = t.TypeOf<typeof hackernewsSearchJobCodec>;

// +++++++++++++
// + Instagram +
// +++++++++++++
export const instagramSearchJobCodec = t.intersection([
  searchJobBaseCodec,
  t.type({
    socialMedia: t.literal("instagram"),
  }),
]);
export type InstagramSearchJob = t.TypeOf<typeof instagramSearchJobCodec>;

// +++++++++++++
// + Youtube +
// +++++++++++++
export const youtubeSearchJobCodec = t.intersection([
  searchJobBaseCodec,
  t.type({
    socialMedia: t.literal("youtube"),
  }),
]);
export type YoutubeSearchJob = t.TypeOf<typeof youtubeSearchJobCodec>;

// +++++++++++++
// + SearchJob +
// +++++++++++++
export const searchJobCodec = t.union([
  twitterSearchJobCodec,
  redditSearchJobCodec,
  hackernewsSearchJobCodec,
  instagramSearchJobCodec,
  youtubeSearchJobCodec,
]);
export type SearchJob = t.TypeOf<typeof searchJobCodec>;
