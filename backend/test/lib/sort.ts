import _ from "lodash";
import { SearchResult } from "../../src/domain/models/searchResult";

export const sortSearchResults = (
  searchResults: SearchResult[]
): SearchResult[] => {
  return _.orderBy(searchResults, ["id"]);
};
