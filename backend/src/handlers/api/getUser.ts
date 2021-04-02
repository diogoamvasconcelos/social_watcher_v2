import { APIGatewayProxyEvent } from "aws-lambda";
import { getLogger } from "../../lib/logger";
import {
  ApiBaseErrorCode,
  ApiErrorResponse,
  ApiRequestMetadata,
  ApiResponse,
} from "./models";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { makeInternalErrorResponse, makeSuccessResponse } from "./responses";
import { isString } from "lodash";
import { makeGetUser } from "../../adapters/userStore/getUser";
import { getClient as getUsersStoreClient } from "../../adapters/userStore/client";
import { getConfig } from "../../lib/config";
import { apigwMiddlewareStack } from "../middlewares/apigwMiddleware";

const config = getConfig();
const logger = getLogger();

type GetUserRequest = ApiRequestMetadata;
type GetUserErrorCode = ApiBaseErrorCode;

const handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiResponse<GetUserErrorCode>> => {
  const usersStoreClient = getUsersStoreClient();
  const getUserFn = makeGetUser(usersStoreClient, config.usersTableName);

  const requestEither = toGetUserRequest(event);
  if (isLeft(requestEither)) {
    return requestEither;
  }
  const request = requestEither.right;

  const userEither = await getUserFn(logger, request.authData.id);
  if (isLeft(userEither)) {
    return left(makeInternalErrorResponse("Error trying to get user."));
  }

  if (userEither.right == "NOT_FOUND") {
    return left(
      makeInternalErrorResponse(`User (id=${request.authData.id}) not found.`)
    );
  }

  return right(makeSuccessResponse(200, userEither.right));
};

export const lambdaHandler = apigwMiddlewareStack(handler);

const toGetUserRequest = (
  event: APIGatewayProxyEvent
): Either<ApiErrorResponse, GetUserRequest> => {
  return toApigwRequestMetadata(event);
};

const toApigwRequestMetadata = (
  event: APIGatewayProxyEvent
): Either<ApiErrorResponse, ApiRequestMetadata> => {
  const id: string | undefined = event.requestContext.authorizer?.claims?.sub;
  const email: string | undefined =
    event.requestContext.authorizer?.claims?.email;
  if (!isString(id) || !isString(email)) {
    return left(
      makeInternalErrorResponse("Failed to get userdata from apigw event")
    );
  }

  return right({ authData: { id, email } });
};
