import { APIGatewayProxyEvent } from "aws-lambda";
import { ApiBaseErrorCode, ApiResponse } from "./models/models";
import { isLeft, right, left } from "fp-ts/lib/Either";
import {
  makeInternalErrorResponse,
  makeRequestMalformedResponse,
  makeSuccessResponse,
} from "./responses";
import { apigwMiddlewareStack } from "@src/handlers/middlewares/apigwMiddleware";
import { getLogger, Logger } from "@src/lib/logger";
import Stripe from "stripe";
import {
  verifyWebhookEvent,
  getClient as getPaymentsClient,
} from "@src/lib/stripe/client";
import { getClientCredentials as getPaymentsCredentials } from "@src/adapters/paymentsManager/client";
import { getClient as getSsmClient } from "@src/lib/ssm";
import { DefaultOkReturn } from "@src/domain/ports/shared";
import { customerSubscriptionEventDataCodec } from "@src/lib/stripe/models";
import {
  getUserByCustomerId,
  GetUserByCustomerIdDeps,
} from "@src/domain/controllers/getUserByCustomerId";
import { makeGetPaymentData } from "@src/adapters/userStore/getPaymentData";
import { getClient as getUsersStoreClient } from "@src/adapters/userStore/client";
import { getConfig } from "@src/lib/config";
import { makeGetUser } from "@src/adapters/userStore/getUser";
import { makeGetUserIdByCustomerId } from "@src/adapters/paymentsManager/getUserIdByCustomerId";
import { PutPaymentDataFn } from "@src/domain/ports/userStore/putPaymentData";
import { PutUserFn } from "@src/domain/ports/userStore/putUser";
import { makePutPaymentData } from "@src/adapters/userStore/putPayment";
import { makePutUser } from "@src/adapters/userStore/putUser";
import { fromUnix } from "@src/lib/date";
import {
  dateISOString,
  decode,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";

const config = getConfig();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiResponse<ApiBaseErrorCode>> => {
  // Dependencies
  const logger = getLogger();
  const paymentsCredentials = await getPaymentsCredentials(
    getSsmClient(),
    logger
  );
  const paymentsClient = getPaymentsClient(paymentsCredentials);
  const userStoreClient = getUsersStoreClient();
  const handleEventDeps: HandleEventDeps = {
    logger,
    getUserFn: makeGetUser(userStoreClient, config.usersTableName),
    getPaymentDataFn: makeGetPaymentData(
      userStoreClient,
      config.usersTableName
    ),
    getUserIdByCustomerIdFn: makeGetUserIdByCustomerId(paymentsClient),
    putPaymentDataFn: makePutPaymentData(
      userStoreClient,
      config.usersTableName
    ),
    putUser: makePutUser(userStoreClient, config.usersTableName, {
      allowOverwrite: true,
    }),
  };

  // event Validation
  const webhookEventEither = verifyWebhookEvent(
    { client: paymentsClient, logger },
    paymentsCredentials,
    event
  );
  if (isLeft(webhookEventEither)) {
    return left(
      makeRequestMalformedResponse("Webhook failed to validate the request")
    );
  }
  const webhookEvent = webhookEventEither.right;

  // Handle event
  const handleWebhookEventEither = await handleWebhookEvent(
    handleEventDeps,
    webhookEvent
  );
  if (isLeft(handleWebhookEventEither)) {
    return left(
      makeInternalErrorResponse(`Failed to handle '${webhookEvent.type}' event`)
    );
  }
  return right(makeSuccessResponse(200, { recieved: true }));
};

export const lambdaHandler = apigwMiddlewareStack(handler);

type HandleEventDeps = { logger: Logger } & GetUserByCustomerIdDeps & {
    putPaymentDataFn: PutPaymentDataFn;
    putUser: PutUserFn;
  };

const handleWebhookEvent = async (
  deps: HandleEventDeps,
  webhookEvent: Stripe.Event
): DefaultOkReturn => {
  switch (webhookEvent.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      return await handleSubscriptionUpdatedEvent(deps, webhookEvent);
    default:
      deps.logger.info("Unhandled event type", {
        type: webhookEvent.type,
        event: webhookEvent,
      });
      return right("OK");
  }
};

const handleSubscriptionUpdatedEvent = async (
  deps: HandleEventDeps,
  event: Stripe.Event
): DefaultOkReturn => {
  // Validation
  const eventDataEither = decode(
    customerSubscriptionEventDataCodec,
    event.data
  );
  if (isLeft(eventDataEither)) {
    deps.logger.error("Failed to decode the stripe's event data");
    return left("ERROR");
  }
  const eventData = eventDataEither.right;

  const newSubsctiption = eventData.object;

  if (newSubsctiption.items.data.length != 1) {
    deps.logger.error(
      "stripe's event data doesn't have exaclty one subscriprion item"
    );
    return left("ERROR");
  }

  const newPriceItem = newSubsctiption.items.data[0];
  if (newPriceItem.price.id != config.stripeNormalProductId) {
    deps.logger.error(
      `stripe's event data price id (${newPriceItem.price.id}) doesn't match expected one (${config.stripeNormalProductId})`
    );
    return left("ERROR");
  }

  const userEither = await getUserByCustomerId(deps, newSubsctiption.customer);
  if (isLeft(userEither)) {
    return userEither;
  }
  if (userEither.right === "NOT_FOUND") {
    deps.logger.error("Failed to find the user that matches the customer id", {
      customer: newSubsctiption.customer,
    });
    return left("ERROR");
  }
  const { user, paymentData } = userEither.right;

  // Update paymentData
  paymentData.stripe.subscriptionId = newSubsctiption.id;
  const putPaymentDataEither = await deps.putPaymentDataFn(
    deps.logger,
    paymentData
  );
  if (isLeft(putPaymentDataEither)) {
    return putPaymentDataEither;
  }

  // Update user subscription
  user.subscription.nofSearchObjects = newPositiveInteger(
    newPriceItem.quantity
  );
  // ref: https://stripe.com/docs/api/subscriptions/object#subscription_object-status
  switch (newSubsctiption.status) {
    case "trialing": {
      if (!newSubsctiption.trial_end) {
        deps.logger.error("newSubsctiption didn't return 'trial_end'", {
          newSubsctiption,
        });
        return left("ERROR");
      }

      const trialExpiresAtEither = decode(
        dateISOString,
        fromUnix(newSubsctiption.trial_end)
      );
      if (isLeft(trialExpiresAtEither)) {
        deps.logger.error("newSubsctiption 'trial_end' failed to be decoded", {
          newSubsctiption,
        });
        return left("ERROR");
      }

      user.subscription.status = "ACTIVE";
      user.subscription.type = "TRIAL";
      user.subscription.expiresAt = trialExpiresAtEither.right;
      break;
    }
    case "active": {
      user.subscription.status = "ACTIVE";
      user.subscription.type = "NORMAL";
      user.subscription.expiresAt = undefined;
      break;
    }
    case "incomplete_expired": {
      user.subscription.status = "INCOMPLETE_EXPIRED";
      break;
    }
    case "unpaid": {
      user.subscription.status = "UNPAID";
      break;
    }
    case "canceled": {
      user.subscription.status = "CANCELED";
      break;
    }
  }

  const putUserEither = await deps.putUser(deps.logger, user);
  if (isLeft(putUserEither)) {
    return putUserEither;
  }

  return right("OK");
};
