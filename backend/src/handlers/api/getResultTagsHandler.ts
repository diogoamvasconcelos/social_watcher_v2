import { APIGatewayProxyEvent } from "aws-lambda";
import { getLogger } from "@src/lib/logger";
import { ApiErrorResponse, ApiResponse } from "./models/models";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { makeInternalErrorResponse, makeSuccessResponse } from "./responses";
import { getClient as getUsersStoreClient } from "@src/adapters/userStore/client";
import { getConfig } from "@src/lib/config";
import { apigwMiddlewareStack } from "@src/handlers/middlewares/apigwMiddleware";
import { toApigwRequestMetadata } from "./shared";
import {
  GetResultTagsErrorCode,
  GetResultTagsRequest,
  GetResultTagsResponse,
} from "./models/getResultTags";
import { makeGetResultTagsForUser } from "@src/adapters/userStore/getResultTagsForUser";
import { ResultTag } from "@src/domain/models/userItem";

const handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiResponse<GetResultTagsErrorCode, GetResultTagsResponse>> => {
  const config = getConfig();
  const logger = getLogger();

  const getResultTagsForUserFn = makeGetResultTagsForUser(
    getUsersStoreClient(),
    config.usersTableName
  );

  const requestEither = toGetResultTagsRequest(event);
  if (isLeft(requestEither)) {
    return requestEither;
  }
  const request = requestEither.right;

  const resultTagsEither = await getResultTagsForUserFn(
    logger,
    request.authData.id
  );
  if (isLeft(resultTagsEither)) {
    return left(
      makeInternalErrorResponse("Error trying to get user's search objects.")
    );
  }
  const resultTags: ResultTag[] = resultTagsEither.right;

  return right(makeSuccessResponse(200, { items: resultTags }));
};

export const lambdaHandler = apigwMiddlewareStack(handler);

const toGetResultTagsRequest = (
  event: APIGatewayProxyEvent
): Either<ApiErrorResponse, GetResultTagsRequest> => {
  return toApigwRequestMetadata(event);
};
