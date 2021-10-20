import { Logger } from "@src/lib/logger";
import { SearchResult } from "@src/domain/models/searchResult";
import { CustomRightReturn } from "@src/domain/ports/shared";
import { ResultTag } from "@src/domain/models/userItem";

export type AddTagToSearchResultFn = (
  logger: Logger,
  searchResult: SearchResult,
  tagId: ResultTag["tagId"]
) => CustomRightReturn<SearchResult>;
