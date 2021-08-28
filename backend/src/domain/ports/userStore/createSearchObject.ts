import { Logger } from "@src/lib/logger";
import { SearchObjectDomain } from "@src/domain/models/userItem";
import { CustomRightReturn } from "@src/domain/ports/shared";

export type CreateSearchObjectFn = (
  logger: Logger,
  searchObject: SearchObjectDomain
) => CustomRightReturn<SearchObjectDomain>;
