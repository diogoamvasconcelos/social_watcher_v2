import { Logger } from "../../../lib/logger";
import { SearchObjectDomain } from "../../models/userItem";
import { DefaultOkReturn } from "../shared";

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
