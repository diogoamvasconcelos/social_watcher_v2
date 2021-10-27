import { APIGatewayProxyEvent } from "aws-lambda";
import { getLogger } from "@src/lib/logger";
import { ApiResponse } from "./models/models";
import { isLeft, left, right } from "fp-ts/lib/Either";
import {
  makeBadRequestResponse,
  makeCustomNotFoundResponse,
  makeInternalErrorResponse,
  makeSuccessResponse,
} from "./responses";
import { getConfig } from "@src/lib/config";
import { apigwMiddlewareStack } from "@src/handlers/middlewares/apigwMiddleware";
import {
  RemoveTagFromResultErrorCode,
  RemoveTagFromResultResponse,
} from "./models/removeTagFromResult";
import { makeGetSearchResult } from "@src/adapters/searchResultsStore/getSearchResult";
import { getClient as getSearchResultStoreClient } from "@src/adapters/searchResultsStore/client";
import { getClient as getUsersStoreClient } from "@src/adapters/userStore/client";
import { makeGetResultTag } from "@src/adapters/userStore/getResultTag";
import { makeRemoveTagFromSearchResult } from "@src/adapters/searchResultsStore/removeTagFromSearchResult";
import { toUpdateTagOnResultRequest } from "./addTagToResultHandler";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<
  ApiResponse<RemoveTagFromResultErrorCode, RemoveTagFromResultResponse>
> => {
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
  const removeTagFromSearchResultsFn = makeRemoveTagFromSearchResult(
    searchResultStoreClient,
    config.searchResultsTableName
  );

  const requestEither = toUpdateTagOnResultRequest(logger, event);
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

  // Check if tag exists on the Search Result
  if (!searchResult.tags?.includes(request.data.tagId)) {
    logger.error("The tag is missing from the searchResult", {
      tagId: request.data.tagId,
    });
    return left(
      makeBadRequestResponse(
        "TAG_MISSING_IN_RESULT",
        "The tag is missing from the searchResult"
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

  const updatedSearchResultEither = await removeTagFromSearchResultsFn(
    logger,
    searchResult,
    request.data.tagId
  );
  if (isLeft(updatedSearchResultEither)) {
    logger.error("Failed to remove tag from search result", {
      searchResult: request.searchResult,
      tag: request.data.tagId,
      error: updatedSearchResultEither.left,
    });
    return left(
      makeInternalErrorResponse("Failed to remove tag from search result")
    );
  }

  return right(makeSuccessResponse(200, updatedSearchResultEither.right));
};

export const lambdaHandler = apigwMiddlewareStack(handler);
