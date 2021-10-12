import { Logger } from "@src/lib/logger";
import { ResultTag } from "@src/domain/models/userItem";
import { CustomRightReturn } from "@src/domain/ports/shared";

export type CreateResultTagFn = (
  logger: Logger,
  resultTag: ResultTag
) => CustomRightReturn<ResultTag>;
