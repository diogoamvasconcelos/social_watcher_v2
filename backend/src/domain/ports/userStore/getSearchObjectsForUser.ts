import { Logger } from "../../../lib/logger";
import { UserId } from "../../models/user";
import { SearchObjectDomain } from "../../models/userItem";
import { CustomRightReturn } from "../shared";

export type GetSearchObjectsForUserFn = (
  logger: Logger,
  id: UserId
) => CustomRightReturn<SearchObjectDomain[]>;
