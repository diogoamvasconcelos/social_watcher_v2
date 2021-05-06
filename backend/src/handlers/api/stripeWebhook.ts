import { APIGatewayProxyEvent } from "aws-lambda";
import { ApiBaseErrorCode, ApiResponse } from "./models/models";
import { isLeft, right, left } from "fp-ts/lib/Either";
import { makeRequestMalformedResponse, makeSuccessResponse } from "./responses";
import { apigwMiddlewareStack } from "../middlewares/apigwMiddleware";
import { getLogger } from "../../lib/logger";
import {
  verifyWebhookEvent,
  getClient as getPaymentsClient,
} from "../../lib/stripe/client";
import { getClientCredentials as getPaymentsCredentials } from "../../adapters/paymentsManager/client";
import { getClient as getSsmClient } from "../../lib/ssm";
import { JsonObjectEncodable } from "../../lib/models/jsonEncodable";

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

  switch (webhookEvent.type) {
    default:
      logger.info("Unhandled event type", {
        type: webhookEvent.type,
        event: (webhookEvent as unknown) as JsonObjectEncodable,
      });
  }

  return right(makeSuccessResponse(200, { recieved: true }));
};

export const lambdaHandler = apigwMiddlewareStack(handler);
