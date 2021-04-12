import { Logger } from "../../../lib/logger";
import { SearchResult } from "../../models/searchResult";
import { DefaultOkReturn } from "../shared";

export type QueueSearchResultsFn = (
  logger: Logger,
  searchResults: SearchResult[]
) => DefaultOkReturn;
