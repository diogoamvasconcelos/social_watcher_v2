import { Logger } from "../../../lib/logger";
import { SearchResult } from "../../models/searchResult";
import { GenericReturn } from "../shared";

export type PutSearchResultsFn = (
  logger: Logger,
  searchResults: SearchResult[]
) => GenericReturn;
