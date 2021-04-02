import { PreSignUpTriggerEvent } from "aws-lambda";
import { defaultMiddlewareStack } from "./middlewares/common";
import { getLogger } from "../lib/logger";
import { addUser } from "../domain/controllers/addUser";
import { getClient as getUserStoreClient } from "../adapters/userStore/client";
import { getConfig } from "../lib/config";
import { isLeft } from "fp-ts/lib/Either";
import { makePutUser } from "../adapters/userStore/putUser";
import { UUIDCodec } from "../lib/uuid";
import { decode } from "../lib/iots";

const config = getConfig();
const logger = getLogger();

const handler = async (event: PreSignUpTriggerEvent) => {
  const userStoreClient = getUserStoreClient();
  const putUserFn = makePutUser(userStoreClient, config.usersTableName);

  const usernameDecoded = decode(UUIDCodec, event.userName);
  if (isLeft(usernameDecoded)) {
    throw new Error(`Username (${event.userName}) not a UUID`);
  }

  const email = event.request.userAttributes.email;
  if (email === "") {
    throw new Error("Email is empty...");
  }

  const result = await addUser({
    putUserFn,
    logger,
    data: {
      id: usernameDecoded.right,
      email,
    },
  });
  if (isLeft(result)) {
    throw new Error("Failed to add user");
  }

  return event;
};

export const lambdaHandler = defaultMiddlewareStack(handler);
