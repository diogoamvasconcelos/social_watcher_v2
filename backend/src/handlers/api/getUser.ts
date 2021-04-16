import * as t from "io-ts";
import { APIGatewayProxyEvent } from "aws-lambda";
import { getLogger } from "../../lib/logger";
import {
  ApiBaseErrorCode,
  ApiErrorResponse,
  ApiRequestMetadata,
  ApiResponse,
} from "./models";
import { Either, isLeft, right } from "fp-ts/lib/Either";
import { makeSuccessResponse } from "./responses";
import { makeGetUser } from "../../adapters/userStore/getUser";
import { getClient as getUsersStoreClient } from "../../adapters/userStore/client";
import { getConfig } from "../../lib/config";
import { apigwMiddlewareStack } from "../middlewares/apigwMiddleware";
import { apiGetUser, toApigwRequestMetadata } from "./shared";
import { User, userCodec } from "../../domain/models/user";

const config = getConfig();
const logger = getLogger();

type GetUserRequest = ApiRequestMetadata;
type GetUserErrorCode = ApiBaseErrorCode;

export const getUserResponseCodec = userCodec;
export type GetUserResponse = t.TypeOf<typeof getUserResponseCodec>;

const handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiResponse<GetUserErrorCode, GetUserResponse>> => {
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
