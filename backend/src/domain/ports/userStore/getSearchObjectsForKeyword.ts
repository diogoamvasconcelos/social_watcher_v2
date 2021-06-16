import { Logger } from "../../../lib/logger";
import { Keyword } from "../../models/keyword";
import { SearchObjectDomain } from "../../models/userItem";
import { CustomRightReturn } from "../shared";

export type GetSearchObjectsForKeywordFn = (
  logger: Logger,
  keyword: Keyword
) => CustomRightReturn<SearchObjectDomain[]>;
