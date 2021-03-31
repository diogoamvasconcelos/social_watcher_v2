import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { defaultOutLayerMiddleware } from "./middlewares/common";
import { getLogger } from "../lib/logger";
import { JsonEncodable } from "../lib/models/jsonEncodable";

const logger = getLogger();

const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  logger.info("Cognito Test", {
    event: (event as unknown) as JsonEncodable,
    context: (context as unknown) as JsonEncodable,
  });

  const response: APIGatewayProxyResult = { statusCode: 200, body: "" };
  return response;
};

export const lambdaHandler = defaultOutLayerMiddleware(handler);
