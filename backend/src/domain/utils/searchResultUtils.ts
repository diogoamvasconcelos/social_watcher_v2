import { throwUnexpectedCase } from "@src/lib/runtime";
import { SearchResult } from "@src/domain/models/searchResult";

export const getSearchResultText = (item: SearchResult) => {
  switch (item.socialMedia) {
    case "twitter":
      return item.data.text;
    case "reddit":
      return item.data.selftext;
    case "hackernews":
      return item.data.text;
    case "instagram":
      return item.data.caption;
    case "youtube":
      return [item.data.title, item.data.description].join("\n");
    default:
      return throwUnexpectedCase(item, "getSearchResultText");
  }
};
