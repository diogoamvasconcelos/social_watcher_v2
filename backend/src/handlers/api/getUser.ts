import { APIGatewayProxyEvent } from "aws-lambda";
import { getLogger } from "../../lib/logger";
import { ApiErrorResponse, ApiResponse } from "./models/models";
import { Either, isLeft, right } from "fp-ts/lib/Either";
import { makeSuccessResponse } from "./responses";
import { makeGetUser } from "../../adapters/userStore/getUser";
import { getClient as getUsersStoreClient } from "../../adapters/userStore/client";
import { getConfig } from "../../lib/config";
import { apigwMiddlewareStack } from "../middlewares/apigwMiddleware";
import { apiGetUser, toApigwRequestMetadata } from "./shared";
import { User } from "../../domain/models/user";
import {
  GetUserErrorCode,
  GetUserRequest,
  GetUserResponse,
} from "./models/getUser";

const handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiResponse<GetUserErrorCode, GetUserResponse>> => {
  const config = getConfig();
  const logger = getLogger();

  // TODO: make a controller for getUser that returns UserData and PaymentData and make controller/getUserByCustomerId use it
  const getUserFn = makeGetUser(getUsersStoreClient(), config.usersTableName);

  const requestEither = toGetUserRequest(event);
  if (isLeft(requestEither)) {
    return requestEither;
  }
  const request = requestEither.right;

  const getUserEither = await apiGetUser({
    logger,
    getUserFn,
    request,
  });

  if (isLeft(getUserEither)) {
    return getUserEither;
  }
  const user: User = getUserEither.right;

  return right(makeSuccessResponse(200, user));
};

export const lambdaHandler = apigwMiddlewareStack(handler);

const toGetUserRequest = (
  event: APIGatewayProxyEvent
): Either<ApiErrorResponse, GetUserRequest> => {
  return toApigwRequestMetadata(event);
};
