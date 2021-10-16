import { Logger } from "@src/lib/logger";
import { UserId } from "@src/domain/models/user";
import { ResultTag } from "@src/domain/models/userItem";
import { CustomRightReturn } from "@src/domain/ports/shared";

export type GetResultTagFn = (
  logger: Logger,
  id: UserId,
  resultTagId: ResultTag["tagId"]
) => CustomRightReturn<ResultTag | "NOT_FOUND">;
