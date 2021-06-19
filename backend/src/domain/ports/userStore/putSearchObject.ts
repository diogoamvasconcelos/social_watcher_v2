import { Logger } from "../../../lib/logger";
import { SearchObjectDomain } from "../../models/userItem";
import { CustomRightReturn } from "../shared";

export type PutSearchObjectFn = (
  logger: Logger,
  searchObject: SearchObjectDomain
) => CustomRightReturn<SearchObjectDomain>;
