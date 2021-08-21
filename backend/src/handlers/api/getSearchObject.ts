import { APIGatewayProxyEvent } from "aws-lambda";
import { getLogger } from "../../lib/logger";
import { ApiResponse } from "./models/models";
import { isLeft, right } from "fp-ts/lib/Either";
import { makeSuccessResponse } from "./responses";
import { getClient as getUsersStoreClient } from "../../adapters/userStore/client";
import { getConfig } from "../../lib/config";
import { apigwMiddlewareStack } from "../middlewares/apigwMiddleware";
import {
  apiGetUser,
  getExistingSearchObject,
  toSearchObjectRequest,
} from "./shared";
import {
  GetSearchObjectErrorCode,
  GetSearchObjectResponse,
} from "./models/getSearchObject";
import { makeGetUser } from "../../adapters/userStore/getUser";
import { makeGetSearchObject } from "../../adapters/userStore/getSearchObject";
import { User } from "../../domain/models/user";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiResponse<GetSearchObjectErrorCode, GetSearchObjectResponse>> => {
  const config = getConfig();
  const logger = getLogger();

  const userStoreClient = getUsersStoreClient();
  const getUserFn = makeGetUser(userStoreClient, config.usersTableName);
  const getSearchObjectFn = makeGetSearchObject(
    userStoreClient,
    config.usersTableName
  );

  const requestEither = toSearchObjectRequest(logger, event);
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

  const searchObjectEither = await getExistingSearchObject({
    logger,
    getSearchObjectFn,
    user,
    request,
  });
  if (isLeft(searchObjectEither)) {
    return searchObjectEither;
  }
  return right(makeSuccessResponse(200, searchObjectEither.right));
};

export const lambdaHandler = apigwMiddlewareStack(handler);
