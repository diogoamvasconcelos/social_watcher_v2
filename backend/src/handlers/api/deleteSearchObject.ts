import { APIGatewayProxyEvent } from "aws-lambda";
import { getLogger } from "../../lib/logger";
import { ApiResponse } from "./models/models";
import { isLeft, left, right } from "fp-ts/lib/Either";
import { makeInternalErrorResponse, makeSuccessResponse } from "./responses";
import { getClient as getUsersStoreClient } from "../../adapters/userStore/client";
import { getConfig } from "../../lib/config";
import { apigwMiddlewareStack } from "../middlewares/apigwMiddleware";
import {
  apiGetUser,
  getExistingSearchObject,
  toSearchObjectRequest,
} from "./shared";
import { makeGetUser } from "../../adapters/userStore/getUser";
import { makeGetSearchObject } from "../../adapters/userStore/getSearchObject";
import { SearchObjectDomain } from "../../domain/models/userItem";
import { User } from "../../domain/models/user";
import {
  DeleteSearchObjectErrorCode,
  DeleteSearchObjectResponse,
} from "./models/deleteSearchObject";
import { deleteSearchObjectAndPrune } from "../../domain/controllers/deleteSearchObjectAndPrune";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<
  ApiResponse<DeleteSearchObjectErrorCode, DeleteSearchObjectResponse>
> => {
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
  const searchObject: SearchObjectDomain = searchObjectEither.right;

  const deleteEither = await deleteSearchObjectAndPrune({
    logger,
    searchObjectKeys: searchObject,
  });
  if (isLeft(deleteEither)) {
    logger.error("Failed to delete search object", { searchObject });
    return left(makeInternalErrorResponse("Failed to delete search object"));
  }

  return right(makeSuccessResponse(200, searchObject));
};

export const lambdaHandler = apigwMiddlewareStack(handler);
