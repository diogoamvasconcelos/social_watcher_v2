import { Keyword } from "../../domain/models/keyword";
import { TwitterSearchResult } from "../../domain/models/searchResult";
import {
  getClient as getTwitterClient,
  SearchRecentResponse,
} from "../../lib/twitter";

export const getClient = getTwitterClient;
export type Client = ReturnType<typeof getClient>;

export const outToDomain = (
  keyword: Keyword,
  out: SearchRecentResponse["data"][0]
): TwitterSearchResult => ({
  socialMedia: "twitter",
  id: out.id,
  keyword,
  happened_at: out.created_at,
  data: out,
});
