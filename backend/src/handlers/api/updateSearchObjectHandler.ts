import { APIGatewayProxyEvent } from "aws-lambda";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { getConfig } from "@src/lib/config";
import { getLogger, Logger } from "@src/lib/logger";
import { apigwMiddlewareStack } from "@src/handlers/middlewares/apigwMiddleware";
import { ApiErrorResponse, ApiResponse } from "./models/models";
import {
  makeBadRequestResponse,
  makeInternalErrorResponse,
  makeSuccessResponse,
} from "./responses";
import { getClient as getUsersStoreClient } from "@src/adapters/userStore/client";
import { makeGetUser } from "@src/adapters/userStore/getUser";
import { makeUpdateSearchObject } from "@src/adapters/userStore/updateSearchObject";
import {
  apiGetUser,
  getExistingSearchObject,
  decodeBodyJSON,
  toSearchObjectRequest,
} from "./shared";
import { User } from "@src/domain/models/user";
import {
  SearchObjectDomain,
  searchObjectUserDataIoCodec,
  searchObjectUserDataIoToDomain,
} from "@src/domain/models/userItem";
import {
  UpdateSearchObjectErrorCode,
  UpdateSearchObjectRequest,
  UpdateSearchObjectResponse,
} from "./models/updateSearchObject";
import { makeGetSearchObject } from "@src/adapters/userStore/getSearchObject";
import { validateKeyword } from "@src/domain/controllers/validateKeyword";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<
  ApiResponse<UpdateSearchObjectErrorCode, UpdateSearchObjectResponse>
> => {
  const config = getConfig();
  const logger = getLogger();

  const userStoreClient = getUsersStoreClient();
  const getUserFn = makeGetUser(userStoreClient, config.usersTableName);
  const updateSearchObjectFn = makeUpdateSearchObject(
    userStoreClient,
    config.usersTableName
  );
  const getSearchObjectFn = makeGetSearchObject(
    userStoreClient,
    config.usersTableName
  );

  const requestEither = toUpdateSearchObjectRequest(logger, event);
  if (isLeft(requestEither)) {
    return requestEither;
  }
  const request = requestEither.right;

  // validate keyword
  const validateKeywordEither = validateKeyword(request.data.keyword);
  if (isLeft(validateKeywordEither)) {
    return left(
      makeBadRequestResponse(
        "INVALID_KEYWORD",
        `Invalid keyword, reason: ${validateKeywordEither.left}`
      )
    );
  }

  const getUserEither = await apiGetUser({
    logger,
    getUserFn,
    request,
  });

  if (isLeft(getUserEither)) {
    return getUserEither;
  }
  const user: User = getUserEither.right;

  const existingSearchObjectEither = await getExistingSearchObject({
    logger,
    getSearchObjectFn,
    user,
    request,
  });
  if (isLeft(existingSearchObjectEither)) {
    return existingSearchObjectEither;
  }
  const existingSearchObject = existingSearchObjectEither.right;

  const mergedSearchObject: SearchObjectDomain = {
    ...existingSearchObject,
    ...searchObjectUserDataIoToDomain(request.data, existingSearchObject),
  };

  const putResultEither = await updateSearchObjectFn(
    logger,
    mergedSearchObject
  );
  if (isLeft(putResultEither)) {
    return left(makeInternalErrorResponse("Failed to put SearchObject."));
  }

  return right(makeSuccessResponse(200, putResultEither.right));
};

export const lambdaHandler = apigwMiddlewareStack(handler);

const toUpdateSearchObjectRequest = (
  logger: Logger,
  event: APIGatewayProxyEvent
): Either<ApiErrorResponse, UpdateSearchObjectRequest> => {
  const searchObjectRequestEither = toSearchObjectRequest(logger, event);
  if (isLeft(searchObjectRequestEither)) {
    return searchObjectRequestEither;
  }

  const bodyEither = decodeBodyJSON({
    logger,
    body: event.body,
    decoder: searchObjectUserDataIoCodec,
  });
  if (isLeft(bodyEither)) {
    return bodyEither;
  }

  return right({
    ...searchObjectRequestEither.right,
    data: bodyEither.right,
  });
};
