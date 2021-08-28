import { Logger } from "@src/lib/logger";
import { SearchResult } from "@src/domain/models/searchResult";
import { DefaultOkReturn } from "@src/domain/ports/shared";

export type QueueSearchResultsFn = (
  logger: Logger,
  searchResults: SearchResult[]
) => DefaultOkReturn;
