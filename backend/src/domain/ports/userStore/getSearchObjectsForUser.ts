import { Logger } from "@src/lib/logger";
import { UserId } from "@src/domain/models/user";
import { SearchObjectDomain } from "@src/domain/models/userItem";
import { CustomRightReturn } from "@src/domain/ports/shared";

export type GetSearchObjectsForUserFn = (
  logger: Logger,
  id: UserId
) => CustomRightReturn<SearchObjectDomain[]>;
