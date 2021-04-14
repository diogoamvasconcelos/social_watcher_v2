import { APIGatewayProxyEvent } from "aws-lambda";
import { right } from "fp-ts/lib/Either";
import { apigwMiddlewareStack } from "../middlewares/apigwMiddleware";
import { ApiBaseErrorCode, ApiResponse } from "./models";
import { makeSuccessResponse } from "./responses";

//const config = getConfig();
//const logger = getLogger();

//type SearchRequest = ApiRequestMetadata;
type SearchErrorCode = ApiBaseErrorCode;

const handler = async (
  _event: APIGatewayProxyEvent
): Promise<ApiResponse<SearchErrorCode>> => {
  return right(makeSuccessResponse(200, {}));
};

export const lambdaHandler = apigwMiddlewareStack(handler);
