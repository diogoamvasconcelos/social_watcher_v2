import { Logger } from "../../../lib/logger";
import { Keyword } from "../../models/keyword";
import { RedditSearchResult } from "../../models/searchResult";
import { CustomRightReturn } from "../shared";

export type SearchRedditFn = (
  logger: Logger,
  keyword: Keyword
) => CustomRightReturn<RedditSearchResult[]>;
