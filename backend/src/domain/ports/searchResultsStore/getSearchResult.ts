import { Logger } from "@src/lib/logger";
import { CustomRightReturn } from "@src/domain/ports/shared";
import { SearchResult } from "@src/domain/models/searchResult";

export type GetSearchResultFn = (
  logger: Logger,
  searchResultId: SearchResult["id"]
) => CustomRightReturn<SearchResult | "NOT_FOUND">;
