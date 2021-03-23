import { SearchResult } from "../../models/searchResult";
import { GenericReturn } from "../shared";

export type PutSearchResultsFn = (
  searchResults: SearchResult[]
) => GenericReturn;
