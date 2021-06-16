import { APIGatewayProxyEvent } from "aws-lambda";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { getConfig } from "../../lib/config";
import { getLogger, Logger } from "../../lib/logger";
import { apigwMiddlewareStack } from "../middlewares/apigwMiddleware";
import { ApiErrorResponse, ApiResponse } from "./models/models";
import {
  makeForbiddenResponse,
  makeInternalErrorResponse,
  makeRequestMalformedResponse,
  makeSuccessResponse,
} from "./responses";
import { getClient as getUsersStoreClient } from "../../adapters/userStore/client";
import { makeGetUser } from "../../adapters/userStore/getUser";
import { makePutSearchObject } from "../../adapters/userStore/putSearchObject";
import { apiGetUser, toApigwRequestMetadata } from "./shared";
import { User } from "../../domain/models/user";
import {
  searchObjectIndexCodec,
  searchObjectUserDataIoCodec,
  searchObjectUserDataIoToDomain,
} from "../../domain/models/userItem";
import { parseSafe } from "@diogovasconcelos/lib";
import { decode } from "@diogovasconcelos/lib";
import {
  UpdateSearchObjectErrorCode,
  UpdateSearchObjectRequest,
  UpdateSearchObjectResponse,
} from "./models/updateSearchObject";
import { makeGetSearchObject } from "../../adapters/userStore/getSearchObject";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<
  ApiResponse<UpdateSearchObjectErrorCode, UpdateSearchObjectResponse>
> => {
  const config = getConfig();
  const logger = getLogger();

  const userStoreClient = getUsersStoreClient();
  const getUserFn = makeGetUser(userStoreClient, config.usersTableName);
  const putSearchObjectFn = makePutSearchObject(
    userStoreClient,
    config.usersTableName
  );
  const getSearchObjectFn = makeGetSearchObject(
    userStoreClient,
    config.usersTableName
  );

  const requestEither = toUpdateKeywordRequest(logger, event);
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

  if (request.index >= user.subscription.nofSearchObjects) {
    logger.error(
      `Trying to update a search object with index (${request.index}) higher than user's nofSearchObjects (${user.subscription.nofSearchObjects})`
    );
    return left(
      makeForbiddenResponse("Provided Search Object index is forbidden.")
    );
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

  const putResultEither = await putSearchObjectFn(logger, {
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

const toUpdateKeywordRequest = (
  logger: Logger,
  event: APIGatewayProxyEvent
): Either<ApiErrorResponse, UpdateSearchObjectRequest> => {
  const metadataEither = toApigwRequestMetadata(event);
  if (isLeft(metadataEither)) {
    return metadataEither;
  }

  const bodyEither = parseSafe(event.body);
  if (isLeft(bodyEither)) {
    logger.error("Failed to parse body to json.", { error: bodyEither.left });
    return left(
      makeRequestMalformedResponse("Request body is not a json file.")
    );
  }
  const body = bodyEither.right;
  const data = decode(searchObjectUserDataIoCodec, body);
  if (isLeft(data)) {
    logger.error("Failed to decode body.", { error: data.left });
    return left(makeRequestMalformedResponse("Request body is invalid."));
  }

  const index = decode(searchObjectIndexCodec, event.pathParameters?.index);
  if (isLeft(index)) {
    logger.error("Failed to decode path paramters.", { error: index.left });
    return left(
      makeRequestMalformedResponse("Request pathParameters are invalid.")
    );
  }

  return right({
    ...metadataEither.right,
    data: data.right,
    index: index.right,
  });
};
