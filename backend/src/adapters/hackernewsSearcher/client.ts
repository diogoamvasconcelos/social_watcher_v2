import { Keyword } from "src/domain/models/keyword";
import { HackernewsSearchResult } from "src/domain/models/searchResult";
import { SearchHNResponseItem } from "src/lib/hackernews/models";
import {
  getClient as getHNClient,
  Client as HNClient,
} from "../../lib/hackernews/client";

export const getClient = getHNClient;
export type Client = HNClient;

export const outToDomain = (
  keyword: Keyword,
  out: SearchHNResponseItem
): HackernewsSearchResult => ({
  socialMedia: "hackernews",
  id: out.objectID,
  keyword,
  happenedAt: out.created_at,
  data: {
    text: out.comment_text ?? out.title ?? "missing text", // TODO: this should be guaranteed, to have comment or title (union type!)
    author: out.author,
    objectId: out.objectID,
    storyId: out.story_id?.toString(),
    numComments: out.num_comments ?? 0,
    storyLink: `https://news.ycombinator.com/item?id=${
      out.story_id ?? out.objectID
    }`,
  },
  link: `https://news.ycombinator.com/item?id=${out.objectID}`,
});
