import { APIGatewayProxyEvent } from "aws-lambda";
import { ApiBaseErrorCode, ApiResponse } from "./models/models";
import { isLeft, right, left } from "fp-ts/lib/Either";
import { makeRequestMalformedResponse, makeSuccessResponse } from "./responses";
import { apigwMiddlewareStack } from "../middlewares/apigwMiddleware";
import { getLogger } from "../../lib/logger";
import { parseSafe } from "../../lib/json";

const handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiResponse<ApiBaseErrorCode>> => {
  const logger = getLogger();

  const stripeEventEither = parseSafe(event.body);
  if (isLeft(stripeEventEither)) {
    return left(makeRequestMalformedResponse("Body is not a JSON object"));
  }
  const stripeEvent = stripeEventEither.right;

  logger.info("Get hooked", { stripeEvent: stripeEvent });

  return right(makeSuccessResponse(200, {}));
};

export const lambdaHandler = apigwMiddlewareStack(handler);
