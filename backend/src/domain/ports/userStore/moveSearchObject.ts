import { Logger } from "@src/lib/logger";
import { SearchObjectDomain } from "@src/domain/models/userItem";
import { DefaultOkReturn } from "@src/domain/ports/shared";

// moves to new index (no duplication, it deletes from the previous position)
export type MoveSearchObjectFn = (
  logger: Logger,
  {
    originalSearchObject,
    newIndex,
  }: {
    originalSearchObject: SearchObjectDomain;
    newIndex: SearchObjectDomain["index"];
    newLockedStatus: SearchObjectDomain["lockedStatus"];
  }
) => DefaultOkReturn;
