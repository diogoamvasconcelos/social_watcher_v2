import { decode, fromEither, positiveInteger } from "../../lib/iots";
import { Logger } from "../../lib/logger";
import { User } from "../models/user";
import { PutUserFn } from "../ports/userStore/putUser";

export const addUser = async ({
  putUserFn,
  logger,
  email,
}: {
  putUserFn: PutUserFn;
  logger: Logger;
  email: User["email"];
}) => {
  const user: User = {
    email,
    subscriptionType: "NORMAL",
    subscriptionStatus: "INACTIVE",
    nofKeywords: fromEither(decode(positiveInteger, 0)),
  };
  logger.info("Creating new user", { user });

  return await putUserFn(logger, user);
};
