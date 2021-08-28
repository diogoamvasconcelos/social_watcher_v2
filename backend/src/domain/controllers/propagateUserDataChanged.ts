import { isLeft, right } from "fp-ts/lib/Either";
import _ from "lodash";
import { Logger } from "@src/lib/logger";
import { UserData } from "@src/domain/models/userItem";
import {
  DefaultOkReturn,
  eitherListToDefaultOk,
} from "@src/domain/ports/shared";
import { GetSearchObjectsForUserFn } from "@src/domain/ports/userStore/getSearchObjectsForUser";
import { UpdateSearchObjectFn } from "@src/domain/ports/userStore/updateSearchObject";

export const propagateUserDataChanged = async (
  {
    logger,
    getSearchObjectsForUserFn,
    updateSearchObjectFn,
  }: {
    logger: Logger;
    getSearchObjectsForUserFn: GetSearchObjectsForUserFn;
    updateSearchObjectFn: UpdateSearchObjectFn;
  },
  userData: UserData
): DefaultOkReturn => {
  // apply nofSearchObjects
  const searchObjectsEither = await getSearchObjectsForUserFn(
    logger,
    userData.id
  );
  if (isLeft(searchObjectsEither)) {
    return searchObjectsEither;
  }
  // sort by index
  const searchObjects = _.orderBy(searchObjectsEither.right, ["index"]);

  const updateSearchObjectsResults = await Promise.all(
    _.range(searchObjects.length).map(async (i) => {
      const searchObject = searchObjects.find((obj) => obj.index == i);
      if (!searchObject) {
        return right("OK");
      }

      if (
        searchObject.lockedStatus === "UNLOCKED" &&
        i >= userData.subscription.nofSearchObjects
      ) {
        logger.info(`Locking searchObject with index=${i}`);
        return await updateSearchObjectFn(logger, {
          ...searchObject,
          lockedStatus: "LOCKED",
        });
      } else if (
        searchObject.lockedStatus === "LOCKED" &&
        i < userData.subscription.nofSearchObjects
      ) {
        logger.info(`Unlocking searchObject with index=${i}`);
        return await updateSearchObjectFn(logger, {
          ...searchObject,
          lockedStatus: "UNLOCKED",
        });
      }

      return right("OK");
    })
  );

  return eitherListToDefaultOk(updateSearchObjectsResults);
};
