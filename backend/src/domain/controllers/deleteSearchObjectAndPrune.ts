import { isLeft, left } from "fp-ts/lib/Either";
import { Logger } from "../../lib/logger";
import { SearchObjectDomain } from "../models/userItem";
import { DefaultOkReturn } from "../ports/shared";
import { GetSearchObjectsForUserFn } from "../ports/userStore/getSearchObjectsForUser";
import { MoveSearchObjectFn } from "../ports/userStore/moveSearchObject";

export type DeleteSearchObjectAndPruneDeps = {
  logger: Logger;
  getSearchObjectsForUserFn: GetSearchObjectsForUserFn;
  moveSearchObjectFn: MoveSearchObjectFn;
  searchObjectKeys: Pick<SearchObjectDomain, "id" | "index" | "lockedStatus">;
};

// Warning: race condition, if an update is made to the searchObject that will replace the one being deleted
export const deleteSearchObjectAndPrune = async ({
  logger,
  getSearchObjectsForUserFn,
  moveSearchObjectFn,
  searchObjectKeys: { id: userId, index, lockedStatus },
}: DeleteSearchObjectAndPruneDeps): DefaultOkReturn => {
  // get latest searchObject index
  const searchObjectsEither = await getSearchObjectsForUserFn(logger, userId);
  if (isLeft(searchObjectsEither)) {
    return searchObjectsEither;
  }
  const searchObjects = searchObjectsEither.right;

  const lastSearchObject = searchObjects.find(
    (obj) => obj.index == searchObjects.length - 1
  );
  if (!lastSearchObject) {
    logger.error(
      "Failed to find the lastSearchObject, something wrong on the indices",
      { searchObjects }
    );
    return left("ERROR");
  }

  return await moveSearchObjectFn(logger, {
    originalSearchObject: lastSearchObject,
    newIndex: index,
    newLockedStatus: lockedStatus,
  });
};
