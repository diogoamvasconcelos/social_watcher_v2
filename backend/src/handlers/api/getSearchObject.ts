import { APIGatewayProxyEvent } from "aws-lambda";
import { getLogger, Logger } from "../../lib/logger";
import { ApiErrorResponse, ApiResponse } from "./models/models";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import {
  makeInternalErrorResponse,
  makeNotFoundResponse,
  makeRequestMalformedResponse,
  makeSuccessResponse,
} from "./responses";
import { getClient as getUsersStoreClient } from "../../adapters/userStore/client";
import { getConfig } from "../../lib/config";
import { apigwMiddlewareStack } from "../middlewares/apigwMiddleware";
import {
  apiGetUser,
  toApigwRequestMetadata,
  validateSearchObjectIndex,
} from "./shared";
import {
  GetSearchObjectErrorCode,
  GetSearchObjectRequest,
  GetSearchObjectResponse,
} from "./models/getSearchObject";
import { makeGetUser } from "../../adapters/userStore/getUser";
import { makeGetSearchObject } from "../../adapters/userStore/getSearchObject";
import {
  SearchObjectDomain,
  searchObjectIndexCodec,
} from "../../domain/models/userItem";
import { decode } from "@diogovasconcelos/lib/iots";
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

  const requestEither = toGetSearchObjectRequest(logger, event);
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

  const searchObjectEither = await getSearchObjectFn(
    logger,
    request.authData.id,
    request.index
  );
  if (isLeft(searchObjectEither)) {
    return left(
      makeInternalErrorResponse("Error trying to get user's search object.")
    );
  }
  if (searchObjectEither.right === "NOT_FOUND") {
    return left(
      makeNotFoundResponse(
        `SearchObject with index:${request.index} does not exist`
      )
    );
  }

  const searchObject: SearchObjectDomain = searchObjectEither.right;
  return right(makeSuccessResponse(200, searchObject));
};

export const lambdaHandler = apigwMiddlewareStack(handler);

const toGetSearchObjectRequest = (
  logger: Logger,
  event: APIGatewayProxyEvent
): Either<ApiErrorResponse, GetSearchObjectRequest> => {
  const metadataEither = toApigwRequestMetadata(event);
  if (isLeft(metadataEither)) {
    return metadataEither;
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

  return right({ ...metadataEither.right, index: indexEither.right });
};
