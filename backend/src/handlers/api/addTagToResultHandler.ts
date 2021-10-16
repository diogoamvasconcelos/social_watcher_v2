// TODO

import { APIGatewayProxyEvent } from "aws-lambda";
import { getLogger, Logger } from "@src/lib/logger";
import { ApiErrorResponse, ApiResponse } from "./models/models";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { makeRequestMalformedResponse, makeSuccessResponse } from "./responses";
import { getClient as getUsersStoreClient } from "@src/adapters/userStore/client";
import { getConfig } from "@src/lib/config";
import { apigwMiddlewareStack } from "@src/handlers/middlewares/apigwMiddleware";
import { apiGetUser, decodeBodyJSON, toApigwRequestMetadata } from "./shared";
import { User } from "@src/domain/models/user";
import {
  AddTagToResultErrorCode,
  AddTagToResultRequest,
  addTagToResultRequestDataCodec,
  AddTagToResultResponse,
} from "./models/addTagToResult";

const handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiResponse<AddTagToResultErrorCode, AddTagToResultResponse>> => {
  const config = getConfig();
  const logger = getLogger();

  // TODO: create adapters

  const requestEither = toAddTagToResultRequest(logger, event);
  if (isLeft(requestEither)) {
    return requestEither;
  }
  const request = requestEither.right;

  // TODO: call controller
  // validate search result exists
  // validate tag exists in user
  // check if tag isn't already on search result, avoid duplicates (add test for this)
  // call controller: add tag using update function (condition on doesn't exist to avoid dups?)
  // return updated searchResult

  return;
};

export const lambdaHandler = apigwMiddlewareStack(handler);

const toAddTagToResultRequest = (
  logger: Logger,
  event: APIGatewayProxyEvent
): Either<ApiErrorResponse, AddTagToResultRequest> => {
  const metadataEither = toApigwRequestMetadata(event);
  if (isLeft(metadataEither)) {
    return metadataEither;
  }

  const bodyEither = decodeBodyJSON({
    logger,
    body: event.body,
    decoder: addTagToResultRequestDataCodec,
  });
  if (isLeft(bodyEither)) {
    return bodyEither;
  }

  return right({
    ...metadataEither.right,
    data: bodyEither.right,
  });
};
