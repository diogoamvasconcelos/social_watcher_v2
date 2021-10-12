import { Logger } from "@src/lib/logger";
import { ResultTag } from "@src/domain/models/userItem";
import { DefaultOkReturn } from "@src/domain/ports/shared";

export type DeleteResultTagFn = (
  logger: Logger,
  resultTagIds: Pick<ResultTag, "id" | "tagId">
) => DefaultOkReturn;
