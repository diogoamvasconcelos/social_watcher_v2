import { Logger } from "../../../lib/logger";
import { UserId } from "../../models/user";
import { SearchObjectDomain } from "../../models/userItem";
import { CustomRightReturn } from "../shared";

export type GetSearchObjectFn = (
  logger: Logger,
  id: UserId,
  index: SearchObjectDomain["index"]
) => CustomRightReturn<SearchObjectDomain | "NOT_FOUND">;
