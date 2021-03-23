import { SearchRecentResponse } from "../../lib/twitter";

export type TwitterSearchResult = SearchRecentResponse["data"][0];

export type SearchResult = {
  type: "twitter";
  data: TwitterSearchResult;
};
