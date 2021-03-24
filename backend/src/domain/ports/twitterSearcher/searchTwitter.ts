import { Logger } from "../../../lib/logger";
import { Keyword } from "../../models/keyword";
import { TwitterSearchResult } from "../../models/searchResult";
import { CustomRightReturn } from "../shared";

export type SearchTwitterFn = (
  logger: Logger,
  keyword: Keyword
) => CustomRightReturn<TwitterSearchResult[]>;
