import { APIGatewayProxyEvent } from "aws-lambda";
import { getConfig } from "../../lib/config";
import { getLogger, Logger } from "../../lib/logger";
import { apigwMiddlewareStack } from "../middlewares/apigwMiddleware";
import {
  CreateSearchObjectErrorCode,
  CreateSearchObjectRequest,
  createSearchObjectResponse,
} from "./models/createSearchObject";
import { ApiErrorResponse, ApiResponse } from "./models/models";
import { getClient as getUsersStoreClient } from "../../adapters/userStore/client";
import { makeGetUser } from "../../adapters/userStore/getUser";
import { makeCreateSearchObject } from "../../adapters/userStore/createSearchObject";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import {
  makeForbiddenResponse,
  makeInternalErrorResponse,
  makeRequestMalformedResponse,
  makeSuccessResponse,
} from "./responses";
import {
  apiGetUser,
  parseRequestBodyJSON,
  toApigwRequestMetadata,
} from "./shared";
import { decode, newPositiveInteger } from "@diogovasconcelos/lib/iots";
import {
  SearchObjectDomain,
  searchObjectUserDataIoCodec,
  searchObjectUserDataIoToDomain,
} from "../../domain/models/userItem";
import { User } from "../../domain/models/user";
import { makeGetSearchObjectsForUser } from "../../adapters/userStore/getSearchObjectsForUser";
import _ from "lodash";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<
  ApiResponse<CreateSearchObjectErrorCode, createSearchObjectResponse>
> => {
  const config = getConfig();
  const logger = getLogger();

  const userStoreClient = getUsersStoreClient();
  const getUserFn = makeGetUser(userStoreClient, config.usersTableName);
  const getSearchObjectsForUserFn = makeGetSearchObjectsForUser(
    getUsersStoreClient(),
    config.usersTableName
  );
  const createSearchObjectFn = makeCreateSearchObject(
    userStoreClient,
    config.usersTableName
  );

  const requestEither = toCreateSearchObjectRequest(logger, event);
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

  const searchObjectsEither = await getSearchObjectsForUserFn(
    logger,
    request.authData.id
  );
  if (isLeft(searchObjectsEither)) {
    return left(
      makeInternalErrorResponse("Error trying to get user's search objects.")
    );
  }
  const searchObjects: SearchObjectDomain[] = searchObjectsEither.right;

  // get next free index
  const freeIndex = newPositiveInteger(searchObjects.length);

  // validate index
  if (freeIndex >= user.subscription.nofSearchObjects) {
    return left(
      makeForbiddenResponse(
        `User already has all search objects in use (${searchObjects.length})`
      )
    );
  }

  if (
    _.some(searchObjects, (searchObject) => searchObject.index == freeIndex)
  ) {
    logger.error("Free index, is already in use by another searchObject", {
      freeIndex,
      searchObjects,
    });
    return left(makeInternalErrorResponse("Error trying get free index"));
  }

  // store new searchObject
  const putResultEither = await createSearchObjectFn(logger, {
    ...searchObjectUserDataIoToDomain(request.data),
    type: "SEARCH_OBJECT",
    id: user.id,
    index: freeIndex,
    lockedStatus: "UNLOCKED",
  });
  if (isLeft(putResultEither)) {
    return left(makeInternalErrorResponse("Failed to put SearchObject."));
  }

  return right(makeSuccessResponse(200, putResultEither.right));
};

export const lambdaHandler = apigwMiddlewareStack(handler);

const toCreateSearchObjectRequest = (
  logger: Logger,
  event: APIGatewayProxyEvent
): Either<ApiErrorResponse, CreateSearchObjectRequest> => {
  const metadataEither = toApigwRequestMetadata(event);
  if (isLeft(metadataEither)) {
    return metadataEither;
  }

  const bodyEither = parseRequestBodyJSON(logger, event.body);
  if (isLeft(bodyEither)) {
    return bodyEither;
  }
  const body = bodyEither.right;

  const dataEither = decode(searchObjectUserDataIoCodec, body);
  if (isLeft(dataEither)) {
    logger.error("Failed to decode data's property of body.", {
      error: dataEither.left,
    });
    return left(makeRequestMalformedResponse("Request body is invalid."));
  }

  return right({
    ...metadataEither.right,
    data: dataEither.right,
  });
};
