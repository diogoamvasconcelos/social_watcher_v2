import { isLeft, right } from "fp-ts/lib/Either";
import _ from "lodash";
import { Logger } from "@src/lib/logger";
import { Keyword } from "@src/domain/models/keyword";
import { UserId } from "@src/domain/models/user";
import { CustomRightReturn } from "@src/domain/ports/shared";
import { GetSearchObjectsForUserFn } from "@src/domain/ports/userStore/getSearchObjectsForUser";

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
