import { Logger } from "../../../lib/logger";
import { SearchObjectDomain } from "../../models/userItem";
import { CustomRightReturn } from "../shared";

export type CreateSearchObjectFn = (
  logger: Logger,
  searchObject: SearchObjectDomain
) => CustomRightReturn<SearchObjectDomain>;
