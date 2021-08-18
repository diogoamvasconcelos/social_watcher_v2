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
  parseRequestBodyJSON,
  toApigwRequestMetadata,
  validateSearchObjectIndex,
} from "./shared";
import { User } from "../../domain/models/user";
import {
  searchObjectIndexCodec,
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
  const validateIndexEither = validateSearchObjectIndex({
    logger,
    user,
    request,
  });
  if (isLeft(validateIndexEither)) {
    return validateIndexEither;
  }

  const currentSearchObjectEither = await getSearchObjectFn(
    logger,
    user.id,
    request.index
  );
  if (isLeft(currentSearchObjectEither)) {
    return left(
      makeInternalErrorResponse("Failed to get current SearchObject.")
    );
  }

  const currentSearchObject =
    currentSearchObjectEither.right !== "NOT_FOUND"
      ? currentSearchObjectEither.right
      : undefined;

  const putResultEither = await updateSearchObjectFn(logger, {
    ...searchObjectUserDataIoToDomain(request.data, currentSearchObject),
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

  const indexEither = decode(
    searchObjectIndexCodec,
    event.pathParameters?.index
  );
  if (isLeft(indexEither)) {
    logger.error("Failed to decode path paramters.", {
      error: indexEither.left,
    });
    return left(
      makeRequestMalformedResponse("Request pathParameters are invalid.")
    );
  }

  return right({
    ...metadataEither.right,
    data: dataEither.right,
    index: indexEither.right,
  });
};
