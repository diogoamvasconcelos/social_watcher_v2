import { Logger } from "@src/lib/logger";
import { User, UserId } from "@src/domain/models/user";
import { CustomRightReturn } from "@src/domain/ports/shared";

export type GetUserFn = (
  logger: Logger,
  id: UserId
) => CustomRightReturn<User | "NOT_FOUND">;
