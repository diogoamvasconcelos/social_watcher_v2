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

const handleSubscriptionUpdatedEvent = async (
  logger: Logger,
  event: Stripe.Event
): DefaultOkReturn => {
  logger.info("got a 'customer.subscription.updated' event", {
    event: (event as unknown) as JsonObjectEncodable,
  });

  return right("OK");
};
