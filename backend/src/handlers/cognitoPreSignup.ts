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
import { makePutPaymentData } from "../adapters/userStore/putPayment";
import { makeInitiateUserSubscription } from "../adapters/paymentsManager/initiateUserSubscription";
import { getClientCredentials as getPaymentsCredentials } from "../adapters/paymentsManager/client";
import { getClient as getPaymentsClient } from "../lib/stripe/client";
import { getSubscriptionConfig } from "../domain/models/subscriptionConfig";
import { getClient as getSsmClient } from "../lib/ssm";

const config = getConfig();
const logger = getLogger();
const subscriptionConfig = getSubscriptionConfig();

const handler = async (event: PreSignUpTriggerEvent) => {
  const paymentsCredentials = await getPaymentsCredentials(
    getSsmClient(),
    logger
  );

  const userStoreClient = getUserStoreClient();
  const paymentsClient = getPaymentsClient(paymentsCredentials);

  const putUserFn = makePutUser(userStoreClient, config.usersTableName);
  const putPaymentDataFn = makePutPaymentData(
    userStoreClient,
    config.usersTableName
  );
  const initiateUserSubscriptionFn = makeInitiateUserSubscription(
    paymentsClient,
    config.stripeNormalProductId,
    subscriptionConfig
  );

  const usernameDecoded = decode(UUIDCodec, event.userName);
  if (isLeft(usernameDecoded)) {
    throw new Error(`Username (${event.userName}) not a UUID`);
  }

  const email = event.request.userAttributes.email;
  if (email === "") {
    throw new Error("Email is empty...");
  }

  const result = await addUser(
    {
      logger,
      putUserFn,
      putPaymentDataFn,
      initiateUserSubscriptionFn,
    },
    {
      id: usernameDecoded.right,
      email,
    }
  );

  if (isLeft(result)) {
    throw new Error("Failed to add user");
  }

  return event;
};

export const lambdaHandler = defaultMiddlewareStack(handler);
