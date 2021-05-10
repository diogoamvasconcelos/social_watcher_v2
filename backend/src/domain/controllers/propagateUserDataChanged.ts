import { isLeft, right } from "fp-ts/lib/Either";
import _ from "lodash";
import { Logger } from "../../lib/logger";
import { UserData } from "../models/userItem";
import { eitherListToDefaultOk } from "../ports/shared";
import { GetSearchObjectsForUserFn } from "../ports/userStore/getSearchObjectsForUser";
import { PutSearchObjectFn } from "../ports/userStore/putSearchObject";

export const propagateUserDataChanged = async (
  {
    logger,
    getSearchObjectsForUserFn,
    putSearchObjectFn,
  }: {
    logger: Logger;
    getSearchObjectsForUserFn: GetSearchObjectsForUserFn;
    putSearchObjectFn: PutSearchObjectFn;
  },
  userData: UserData
) => {
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
        return await putSearchObjectFn(logger, {
          ...searchObject,
          lockedStatus: "LOCKED",
        });
      } else if (
        searchObject.lockedStatus === "LOCKED" &&
        i < userData.subscription.nofSearchObjects
      ) {
        logger.info(`Unlocking searchObject with index=${i}`);
        return await putSearchObjectFn(logger, {
          ...searchObject,
          lockedStatus: "UNLOCKED",
        });
      }

      return right("OK");
    })
  );

  return eitherListToDefaultOk(updateSearchObjectsResults);
};
