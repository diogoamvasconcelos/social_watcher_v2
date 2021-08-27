import { APIGatewayProxyEvent } from "aws-lambda";
import { getLogger } from "@src/lib/logger";
import { ApiResponse } from "./models/models";
import { isLeft, left, right } from "fp-ts/lib/Either";
import { makeInternalErrorResponse, makeSuccessResponse } from "./responses";
import { getClient as getUsersStoreClient } from "@src/adapters/userStore/client";
import { getConfig } from "@src/lib/config";
import { apigwMiddlewareStack } from "@src/handlers/middlewares/apigwMiddleware";
import {
  apiGetUser,
  getExistingSearchObject,
  toSearchObjectRequest,
} from "./shared";
import { makeGetUser } from "@src/adapters/userStore/getUser";
import { makeGetSearchObject } from "@src/adapters/userStore/getSearchObject";
import { SearchObjectDomain } from "@src/domain/models/userItem";
import { User } from "@src/domain/models/user";
import {
  DeleteSearchObjectErrorCode,
  DeleteSearchObjectResponse,
} from "./models/deleteSearchObject";
import { deleteSearchObjectAndPrune } from "@src/domain/controllers/deleteSearchObjectAndPrune";
import { makeGetSearchObjectsForUser } from "@src/adapters/userStore/getSearchObjectsForUser";
import { makeMoveSearchObject } from "@src/adapters/userStore/moveSearchObject";

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
  const getSearchObjectsForUserFn = makeGetSearchObjectsForUser(
    userStoreClient,
    config.usersTableName
  );
  const moveSearchObjectFn = makeMoveSearchObject(
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
    getSearchObjectsForUserFn,
    moveSearchObjectFn,
    searchObjectKeys: searchObject,
  });
  if (isLeft(deleteEither)) {
    logger.error("Failed to delete search object", { searchObject });
    return left(makeInternalErrorResponse("Failed to delete search object"));
  }

  return right(makeSuccessResponse(200, searchObject));
};

export const lambdaHandler = apigwMiddlewareStack(handler);
