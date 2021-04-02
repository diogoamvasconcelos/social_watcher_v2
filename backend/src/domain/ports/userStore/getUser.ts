import { Logger } from "../../../lib/logger";
import { User } from "../../models/user";
import { CustomRightReturn } from "../shared";

export type GetUserFn = (
  logger: Logger,
  id: User["id"]
) => CustomRightReturn<User | "NOT_FOUND">;
