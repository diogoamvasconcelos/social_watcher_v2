import { Logger } from "../../../lib/logger";
import { SearchObject } from "../../models/userItem";
import { CustomRightReturn } from "../shared";

export type putSearchObjectFn = (
  logger: Logger,
  searchObject: SearchObject
) => CustomRightReturn<SearchObject>;
