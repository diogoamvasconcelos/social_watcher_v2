import { Logger } from "../../../lib/logger";
import { User, UserId } from "../../models/user";
import { CustomRightReturn } from "../shared";

export type GetUserFn = (
  logger: Logger,
  id: UserId
) => CustomRightReturn<User | "NOT_FOUND">;
