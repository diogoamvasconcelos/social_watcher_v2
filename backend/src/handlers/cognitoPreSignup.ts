import { PreSignUpTriggerEvent } from "aws-lambda";
import { defaultOutLayerMiddleware } from "./middlewares/common";
import { getLogger } from "../lib/logger";

const logger = getLogger();

const handler = async (event: PreSignUpTriggerEvent) => {
  const userEmail = event.request.userAttributes.email;
  if (userEmail === "") {
    throw new Error("Email is empty...");
  }

  logger.info(`Signing up user with email: ${userEmail}`);

  return event;
};

export const lambdaHandler = defaultOutLayerMiddleware(handler);
