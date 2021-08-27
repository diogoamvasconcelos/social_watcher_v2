import { Logger } from "@src/lib/logger";
import { Keyword } from "@src/domain/models/keyword";
import { SearchObjectDomain } from "@src/domain/models/userItem";
import { CustomRightReturn } from "@src/domain/ports/shared";

export type GetSearchObjectsForKeywordFn = (
  logger: Logger,
  keyword: Keyword
) => CustomRightReturn<SearchObjectDomain[]>;
