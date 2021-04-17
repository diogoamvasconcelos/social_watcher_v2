import { isLeft, right } from "fp-ts/lib/Either";
import _ from "lodash";
import { Logger } from "../../lib/logger";
import { Keyword } from "../models/keyword";
import { UserId } from "../models/user";
import { CustomRightReturn } from "../ports/shared";
import { GetSearchObjectsForUserFn } from "../ports/userStore/getSearchObjectsForUser";

export const isKeywordAllowed = async (
  {
    logger,
    getSearchObjectsForUserFn,
  }: { logger: Logger; getSearchObjectsForUserFn: GetSearchObjectsForUserFn },
  keyword: Keyword,
  userId: UserId
): CustomRightReturn<boolean> => {
  const userSearchObjectsEither = await getSearchObjectsForUserFn(
    logger,
    userId
  );
  if (isLeft(userSearchObjectsEither)) {
    return userSearchObjectsEither;
  }
  const userSearchObjects = userSearchObjectsEither.right;

  return right(
    _.some(
      userSearchObjects,
      (searchObject) =>
        searchObject.keyword == keyword &&
        searchObject.lockedStatus == "UNLOCKED"
    )
  );
};
