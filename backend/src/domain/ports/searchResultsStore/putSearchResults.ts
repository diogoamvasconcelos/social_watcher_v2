import { Logger } from "../../../lib/logger";
import { SearchResult } from "../../models/searchResult";
import { DefaultOkReturn } from "../shared";

export type PutSearchResultsFn = (
  logger: Logger,
  searchResults: SearchResult[]
) => DefaultOkReturn;
