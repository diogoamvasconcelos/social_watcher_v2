import { Logger } from "@src/lib/logger";
import { SearchResult } from "@src/domain/models/searchResult";
import { DefaultOkReturn } from "@src/domain/ports/shared";

export type PutSearchResultsFn = (
  logger: Logger,
  searchResults: SearchResult[]
) => DefaultOkReturn;
