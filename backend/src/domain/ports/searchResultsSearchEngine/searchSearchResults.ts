import { Logger } from "../../../lib/logger";
import { Keyword } from "../../models/keyword";
import { SearchResult } from "../../models/searchResult";
import { CustomRightReturn } from "../shared";

export type SearchSearchResultsFn = (
  logger: Logger,
  keyword: Keyword,
  dataQuery?: string
) => CustomRightReturn<SearchResult[]>;
