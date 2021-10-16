import { Keyword } from "@src/domain/models/keyword";
import {
  HackernewsSearchResult,
  toUniqueId,
} from "@src/domain/models/searchResult";
import { SearchHackernewsItem } from "@src/lib/hackernews/models";
import {
  getClient as getHackernewsClient,
  Client as HackernewsClient,
} from "@src/lib/hackernews/client";

export const getClient = getHackernewsClient;
export type Client = HackernewsClient;

export const outToDomain = (
  keyword: Keyword,
  out: SearchHackernewsItem
): HackernewsSearchResult => {
  const socialMedia = "hackernews";
  const localId = out.objectID;
  return {
    id: toUniqueId({ socialMedia, localId }),
    socialMedia,
    localId,
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
      fuzzyMatch: out.fuzzy_match,
    },
    link: `https://news.ycombinator.com/item?id=${out.objectID}`,
  };
};
