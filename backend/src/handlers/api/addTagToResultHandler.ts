// TODO: Add tests

import { APIGatewayProxyEvent } from "aws-lambda";
import { getLogger, Logger } from "@src/lib/logger";
import { ApiErrorResponse, ApiResponse } from "./models/models";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import {
  makeBadRequestResponse,
  makeCustomNotFoundResponse,
  makeInternalErrorResponse,
  makeRequestMalformedResponse,
  makeSuccessResponse,
} from "./responses";
import { getConfig } from "@src/lib/config";
import { apigwMiddlewareStack } from "@src/handlers/middlewares/apigwMiddleware";
import { decodeBodyJSON, toApigwRequestMetadata } from "./shared";
import {
  AddTagToResultErrorCode,
  AddTagToResultRequest,
  addTagToResultUserDataCodec,
  AddTagToResultResponse,
} from "./models/addTagToResult";
import { decode } from "@diogovasconcelos/lib/iots";
import { searchResultIdCodec } from "@src/domain/models/searchResult";
import { makeGetSearchResult } from "@src/adapters/searchResultsStore/getSearchResult";
import { getClient as getSearchResultStoreClient } from "@src/adapters/searchResultsStore/client";
import { getClient as getUsersStoreClient } from "@src/adapters/userStore/client";
import { makeGetResultTag } from "@src/adapters/userStore/getResultTag";
import { makeAddTagToSearchResult } from "@src/adapters/searchResultsStore/addTagToSearchResult";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiResponse<AddTagToResultErrorCode, AddTagToResultResponse>> => {
  const config = getConfig();
  const logger = getLogger();

  const searchResultStoreClient = getSearchResultStoreClient();
  const getSearchResultFn = makeGetSearchResult(
    searchResultStoreClient,
    config.searchResultsTableName
  );
  const usersStoreClient = getUsersStoreClient();
  const getResultTagForUsers = makeGetResultTag(
    usersStoreClient,
    config.usersTableName
  );
  const addTagToSearchResultsFn = makeAddTagToSearchResult(
    searchResultStoreClient,
    config.searchResultsTableName
  );

  const requestEither = toAddTagToResultRequest(logger, event);
  if (isLeft(requestEither)) {
    return requestEither;
  }
  const request = requestEither.right;

  // Get searchResult
  const getSearchResultEither = await getSearchResultFn(
    logger,
    request.searchResult.id
  );
  if (isLeft(getSearchResultEither)) {
    logger.error("Failed attempting to get search result", {
      searchResult: request.searchResult,
      error: getSearchResultEither.left,
    });
    return left(
      makeInternalErrorResponse("Failed attempting to get search result")
    );
  }
  if (getSearchResultEither.right === "NOT_FOUND") {
    return left(
      makeCustomNotFoundResponse(
        "SEARCH_RESULT_NOT_FOUND",
        "Failed attempting to get search result"
      )
    );
  }
  const searchResult = getSearchResultEither.right;

  // Check if tag isn't already on search result, avoid duplicates (add test for this)
  if (searchResult.tags?.includes(request.data.tagId)) {
    logger.error("The tag has already been added to the searchResult.", {
      tagId: request.data.tagId,
    });
    return left(
      makeBadRequestResponse(
        "TAG_ALREADY_ADDED",
        "The tag has already been added to the searchResult."
      )
    );
  }

  // Get users resultTag
  const getResultTagEither = await getResultTagForUsers(
    logger,
    request.authData.id,
    request.data.tagId
  );
  if (isLeft(getResultTagEither)) {
    logger.error("Failed attempting to get result tag", {
      searchResult: request.searchResult,
      error: getResultTagEither.left,
    });
    return left(
      makeInternalErrorResponse("Failed attempting to get result tag")
    );
  }
  if (getResultTagEither.right === "NOT_FOUND") {
    return left(
      makeCustomNotFoundResponse(
        "RESULT_TAG_NOT_FOUND",
        "Failed attempting to get search result"
      )
    );
  }

  const updatedSearchResultEither = await addTagToSearchResultsFn(
    logger,
    searchResult,
    request.data.tagId
  );
  if (isLeft(updatedSearchResultEither)) {
    logger.error("Failed to add tag to search result", {
      searchResult: request.searchResult,
      tag: request.data.tagId,
      error: updatedSearchResultEither.left,
    });
    return left(
      makeInternalErrorResponse("Failed to add tag to search result")
    );
  }

  return right(makeSuccessResponse(200, updatedSearchResultEither.right));
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

  const idEither = decode(searchResultIdCodec, event.pathParameters?.resultId);
  if (isLeft(idEither)) {
    logger.error("Failed to decode path paramters.", {
      error: idEither.left,
    });
    return left(
      makeRequestMalformedResponse("Request pathParameters are invalid.")
    );
  }

  const bodyEither = decodeBodyJSON({
    logger,
    body: event.body,
    decoder: addTagToResultUserDataCodec,
  });
  if (isLeft(bodyEither)) {
    return bodyEither;
  }

  return right({
    ...metadataEither.right,
    searchResult: { id: idEither.right },
    data: bodyEither.right,
  });
};
