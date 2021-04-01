import { PreSignUpTriggerEvent } from "aws-lambda";
import { defaultOutLayerMiddleware } from "./middlewares/common";
import { getLogger } from "../lib/logger";
import { addUser } from "../domain/controllers/addUser";
import { getClient as getUserStoreClient } from "../adapters/userStore/client";
import { getConfig } from "../lib/config";
import { isLeft } from "fp-ts/lib/Either";
import { makePutUser } from "../adapters/userStore/putUser";

const config = getConfig();
const logger = getLogger();

const handler = async (event: PreSignUpTriggerEvent) => {
  const userStoreClient = getUserStoreClient();
  const putUserFn = makePutUser(userStoreClient, config.usersTableName);

  const email = event.request.userAttributes.email;
  if (email === "") {
    throw new Error("Email is empty...");
  }

  logger.info(`Signing up user with email: ${email}`);

  const result = await addUser({ putUserFn, logger, email });
  if (isLeft(result)) {
    throw new Error("Failed to add user");
  }

  return event;
};

export const lambdaHandler = defaultOutLayerMiddleware(handler);
