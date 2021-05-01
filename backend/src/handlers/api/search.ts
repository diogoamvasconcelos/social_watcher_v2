import { APIGatewayProxyEvent } from "aws-lambda";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { parseSafe } from "../../lib/json";
import { getLogger, Logger } from "../../lib/logger";
import { apigwMiddlewareStack } from "../middlewares/apigwMiddleware";
import { ApiErrorResponse, ApiResponse } from "./models/models";
import {
  makeForbiddenResponse,
  makeInternalErrorResponse,
  makeRequestMalformedResponse,
  makeSuccessResponse,
} from "./responses";
import { toApigwRequestMetadata } from "./shared";
import { decode } from "../../lib/iots";
import { getConfig } from "../../lib/config";
import { isKeywordAllowed } from "../../domain/controllers/isKeywordAllowed";
import { getClient as getUsersStoreClient } from "../../adapters/userStore/client";
import { getClient as getSearchEngineClient } from "../../adapters/searchResultsSearchEngine/client";
import { makeGetSearchObjectsForUser } from "../../adapters/userStore/getSearchObjetcsForUser";
import { makeSearchSearchResults } from "../../adapters/searchResultsSearchEngine/searchSearchResults";
import {
  SearchErrorCode,
  SearchRequest,
  searchRequestUserDataCodec,
  SearchResponse,
} from "./models/search";

const handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiResponse<SearchErrorCode, SearchResponse>> => {
  const config = getConfig();
  const logger = getLogger();

  const userStoreClient = getUsersStoreClient();
  const getSearchObjectsForUserFn = makeGetSearchObjectsForUser(
    userStoreClient,
    config.usersTableName
  );

  const searchEngineClient = getSearchEngineClient(config.mainElasticSearchUrl);
  const searchSearchResultsFn = makeSearchSearchResults(searchEngineClient);

  const requestEither = toSearchRequest(logger, event);
  if (isLeft(requestEither)) {
    return requestEither;
  }
  const request = requestEither.right;

  const keywordAllowedEither = await isKeywordAllowed(
    { logger, getSearchObjectsForUserFn },
    request.keyword,
    request.authData.id
  );
  if (isLeft(keywordAllowedEither)) {
    return left(
      makeInternalErrorResponse("Failed to check if keyword is allowed.")
    );
  }
  if (!keywordAllowedEither.right) {
    return left(
      makeForbiddenResponse("Keyword not part of user's SearchObjects.")
    );
  }

  const searchResultEither = await searchSearchResultsFn(logger, {
    keyword: request.keyword,
    dataQuery: request.dataQuery,
    // pagination : {...} // fully implemented but not tested!
  });
  if (isLeft(searchResultEither)) {
    return left(makeInternalErrorResponse("Failed to search."));
  }

  return right(makeSuccessResponse(200, searchResultEither.right));
};

export const lambdaHandler = apigwMiddlewareStack(handler);

const toSearchRequest = (
  logger: Logger,
  event: APIGatewayProxyEvent
): Either<ApiErrorResponse, SearchRequest> => {
  const metadataEither = toApigwRequestMetadata(event);
  if (isLeft(metadataEither)) {
    return metadataEither;
  }

  const bodyEither = parseSafe(event.body ?? "");
  if (isLeft(bodyEither)) {
    logger.error("Failed to parse body to json.", { error: bodyEither.left });
    return left(
      makeRequestMalformedResponse("Request body is not a json file.")
    );
  }
  const body = bodyEither.right;

  const userDataEither = decode(searchRequestUserDataCodec, body);
  if (isLeft(userDataEither)) {
    return left(makeRequestMalformedResponse("Request body is invalid."));
  }

  return right({
    ...metadataEither.right,
    ...userDataEither.right,
  });
};
