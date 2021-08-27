import { Logger } from "@src/lib/logger";
import { UserId } from "@src/domain/models/user";
import { SearchObjectDomain } from "@src/domain/models/userItem";
import { CustomRightReturn } from "@src/domain/ports/shared";

export type GetSearchObjectFn = (
  logger: Logger,
  id: UserId,
  index: SearchObjectDomain["index"]
) => CustomRightReturn<SearchObjectDomain | "NOT_FOUND">;
