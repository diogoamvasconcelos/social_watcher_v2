import { APIGatewayProxyEvent } from "aws-lambda";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { getConfig } from "../../lib/config";
import { getLogger, Logger } from "../../lib/logger";
import { apigwMiddlewareStack } from "../middlewares/apigwMiddleware";
import { ApiErrorResponse, ApiResponse } from "./models/models";
import {
  makeInternalErrorResponse,
  makeRequestMalformedResponse,
  makeSuccessResponse,
} from "./responses";
import { getClient as getUsersStoreClient } from "../../adapters/userStore/client";
import { makeGetUser } from "../../adapters/userStore/getUser";
import { makeUpdateSearchObject } from "../../adapters/userStore/updateSearchObject";
import {
  apiGetUser,
  getExistingSearchObject,
  parseRequestBodyJSON,
  toSearchObjectRequest,
} from "./shared";
import { User } from "../../domain/models/user";
import {
  searchObjectUserDataIoCodec,
  searchObjectUserDataIoToDomain,
} from "../../domain/models/userItem";
import {
  UpdateSearchObjectErrorCode,
  UpdateSearchObjectRequest,
  UpdateSearchObjectResponse,
} from "./models/updateSearchObject";
import { makeGetSearchObject } from "../../adapters/userStore/getSearchObject";
import { decode } from "@diogovasconcelos/lib/iots";

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

  const putResultEither = await updateSearchObjectFn(logger, {
    ...searchObjectUserDataIoToDomain(request.data, searchObjectEither.right),
    type: "SEARCH_OBJECT",
    id: user.id,
    index: request.index,
    lockedStatus: "UNLOCKED",
  });
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
    ...searchObjectRequestEither.right,
    data: dataEither.right,
  });
};
