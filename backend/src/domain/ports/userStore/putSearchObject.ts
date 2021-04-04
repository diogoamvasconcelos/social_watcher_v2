import { Logger } from "../../../lib/logger";
import { SearchObject } from "../../models/searchObject";
import { CustomRightReturn } from "../shared";

export type putSearchObjectFn = (
  logger: Logger,
  searchObject: SearchObject
) => CustomRightReturn<SearchObject>;
