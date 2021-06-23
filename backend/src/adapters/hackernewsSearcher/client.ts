import {
  getClient as getHNClient,
  Client as HNClient,
} from "../../lib/hackernews/client";

export const getClient = getHNClient;
export type Client = HNClient;

/*

link: https://news.ycombinator.com/item?id=<objectID>
storylink: https://news.ycombinator.com/item?id=<storyID> (if comment)

export const outToDomain = (
  keyword: Keyword,
  out: SearchListingItem
): RedditSearchResult => ({
  socialMedia: "reddit",
  id: out.id,
  keyword,
  happenedAt: fromUnix(out.created_utc),
  data: out,
  link: `https://reddit/${out.permalink}`,
});
*/
