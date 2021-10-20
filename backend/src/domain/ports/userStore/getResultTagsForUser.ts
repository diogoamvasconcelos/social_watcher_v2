import { Logger } from "@src/lib/logger";
import { UserId } from "@src/domain/models/user";
import { ResultTag } from "@src/domain/models/userItem";
import { CustomRightReturn } from "@src/domain/ports/shared";

export type GetResultTagsForUserFn = (
  logger: Logger,
  id: UserId
) => CustomRightReturn<ResultTag[]>;
