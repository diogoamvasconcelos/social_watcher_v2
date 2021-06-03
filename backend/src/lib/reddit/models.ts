import * as t from "io-ts";

export const redditCredentialsCodec = t.type({
  id: t.string,
  secret: t.string,
  username: t.string,
  password: t.string,
});
export type RedditCredentials = t.TypeOf<typeof redditCredentialsCodec>;

export const searchListingItemCodec = t.exact(
  t.type({
    author: t.string,
    title: t.string,
    selftext: t.string,
    id: t.string,
    permalink: t.string,
    created_utc: t.number,
    num_comments: t.number,
    num_crossposts: t.number,
    ups: t.number,
    subreddit: t.string,
    subreddit_subscribers: t.number,
    over_18: t.boolean,
  })
);
export type SearchListingItem = t.TypeOf<typeof searchListingItemCodec>;

export const searchListingCodec = t.type({
  kind: t.literal("Listing"),
  data: t.type({
    dist: t.number,
    children: t.array(
      t.type({
        data: searchListingItemCodec,
      })
    ),
  }),
});
export type SearchListing = t.TypeOf<typeof searchListingCodec>;
