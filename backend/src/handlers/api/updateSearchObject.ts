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
import { makePutSearchObject } from "../../adapters/userStore/putSearchObject";
import {
  apiGetUser,
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
import { parseSafe } from "@diogovasconcelos/lib/json";

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
  const dataEither = decode(searchObjectUserDataIoCodec, body);
  if (isLeft(dataEither)) {
    logger.error("Failed to decode body.", { error: dataEither.left });
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
