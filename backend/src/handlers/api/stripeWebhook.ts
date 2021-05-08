import { APIGatewayProxyEvent } from "aws-lambda";
import { ApiBaseErrorCode, ApiResponse } from "./models/models";
import { isLeft, right, left } from "fp-ts/lib/Either";
import {
  makeInternalErrorResponse,
  makeRequestMalformedResponse,
  makeSuccessResponse,
} from "./responses";
import { apigwMiddlewareStack } from "../middlewares/apigwMiddleware";
import { getLogger, Logger } from "../../lib/logger";
import Stripe from "stripe";
import {
  verifyWebhookEvent,
  getClient as getPaymentsClient,
} from "../../lib/stripe/client";
import { getClientCredentials as getPaymentsCredentials } from "../../adapters/paymentsManager/client";
import { getClient as getSsmClient } from "../../lib/ssm";
import { JsonObjectEncodable } from "../../lib/models/jsonEncodable";
import { DefaultOkReturn } from "../../domain/ports/shared";
import { customerSubscriptionEventDataCodec } from "../../lib/stripe/models";
import { decode } from "../../lib/iots";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiResponse<ApiBaseErrorCode>> => {
  const logger = getLogger();
  const paymentsCredentials = await getPaymentsCredentials(
    getSsmClient(),
    logger
  );
  const paymentsClient = getPaymentsClient(paymentsCredentials);

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

  const handleWebhookEventEither = await handleWebhookEvent(
    logger,
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

const handleWebhookEvent = async (
  logger: Logger,
  webhookEvent: Stripe.Event
): DefaultOkReturn => {
  switch (webhookEvent.type) {
    case "customer.subscription.created": {
      return handleSubscriptionCreatedEvent(logger, webhookEvent);
    }
    case "customer.subscription.updated":
      return await handleSubscriptionUpdatedEvent(logger, webhookEvent);
    default:
      logger.info("Unhandled event type", {
        type: webhookEvent.type,
        event: (webhookEvent as unknown) as JsonObjectEncodable,
      });
      return right("OK");
  }
};

const handleSubscriptionCreatedEvent = async (
  logger: Logger,
  event: Stripe.Event
): DefaultOkReturn => {
  logger.info("got a 'customer.subscription.updated' event", {
    event: (event as unknown) as JsonObjectEncodable,
  });

  const eventDataEither = decode(
    customerSubscriptionEventDataCodec,
    event.data
  );
  if (isLeft(eventDataEither)) {
    logger.error("Failed to decode the stripe's event data");
    return left("ERROR");
  }
  //const eventData = eventDataEither.right;
  // TODO: get user with customer id

  // TODO update user's paymentData with new subscription
  return handleSubscriptionUpdatedEvent(logger, event);
};

const handleSubscriptionUpdatedEvent = async (
  logger: Logger,
  event: Stripe.Event
): DefaultOkReturn => {
  logger.info("got a 'customer.subscription.updated' event", {
    event: (event as unknown) as JsonObjectEncodable,
  });

  const eventDataEither = decode(
    customerSubscriptionEventDataCodec,
    event.data
  );
  if (isLeft(eventDataEither)) {
    logger.error("Failed to decode the stripe's event data");
    return left("ERROR");
  }
  const eventData = eventDataEither.right;

  // ref: https://stripe.com/docs/api/subscriptions/object#subscription_object-status
  switch (eventData.object.status) {
    case "trialing": {
      //TODO: do nothing if already trailing?
      //TODO: update nofSearchObjects based on quantity
      break;
    }
    case "active": {
      //TODO: active account
      //TODO: update nofSearchObjects based on quantity
      break;
    }
    case "incomplete_expired": {
      //TODO: deactive account
      break;
    }
    case "unpaid": {
      //TODO: deactive account
      break;
    }
    case "canceled": {
      //TODO: deactive account
      break;
    }
  }

  return right("OK");
};
