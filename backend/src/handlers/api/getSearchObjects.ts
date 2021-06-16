import { APIGatewayProxyEvent } from "aws-lambda";
import { getLogger } from "../../lib/logger";
import { ApiErrorResponse, ApiResponse } from "./models/models";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { makeInternalErrorResponse, makeSuccessResponse } from "./responses";
import { getClient as getUsersStoreClient } from "../../adapters/userStore/client";
import { getConfig } from "../../lib/config";
import { apigwMiddlewareStack } from "../middlewares/apigwMiddleware";
import { toApigwRequestMetadata } from "./shared";
import {
  GetSearchObjectsErrorCode,
  GetSearchObjectsRequest,
  GetSearchObjectsResponse,
} from "./models/getSearchObjects";
import { makeGetSearchObjectsForUser } from "../../adapters/userStore/getSearchObjectsForUser";
import { SearchObjectDomain } from "src/domain/models/userItem";

const handler = async (
  event: APIGatewayProxyEvent
): Promise<
  ApiResponse<GetSearchObjectsErrorCode, GetSearchObjectsResponse>
> => {
  const config = getConfig();
  const logger = getLogger();

  const getSearchObjectsForUserFn = makeGetSearchObjectsForUser(
    getUsersStoreClient(),
    config.usersTableName
  );

  const requestEither = toGetSearchObjectsRequest(event);
  if (isLeft(requestEither)) {
    return requestEither;
  }
  const request = requestEither.right;

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

  return right(makeSuccessResponse(200, { items: searchObjects }));
};

export const lambdaHandler = apigwMiddlewareStack(handler);

const toGetSearchObjectsRequest = (
  event: APIGatewayProxyEvent
): Either<ApiErrorResponse, GetSearchObjectsRequest> => {
  return toApigwRequestMetadata(event);
};
