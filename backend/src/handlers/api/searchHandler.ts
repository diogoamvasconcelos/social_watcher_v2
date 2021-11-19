import { APIGatewayProxyEvent } from "aws-lambda";
import { isLeft, isRight, left, right } from "fp-ts/lib/Either";
import { getLogger } from "@src/lib/logger";
import { apigwMiddlewareStack } from "@src/handlers/middlewares/apigwMiddleware";
import { ApiResponse } from "./models/models";
import {
  makeForbiddenResponse,
  makeInternalErrorResponse,
  makeSuccessResponse,
} from "./responses";
import { toRequestWithUserData } from "./shared";
import { getConfig } from "@src/lib/config";
import { isUserUsingKeyword } from "@src/domain/controllers/isUserUsingKeyword";
import { getClient as getUsersStoreClient } from "@src/adapters/userStore/client";
import { getClient as getSearchEngineClient } from "@src/adapters/searchResultsSearchEngine/client";
import { makeGetSearchObjectsForUser } from "@src/adapters/userStore/getSearchObjectsForUser";
import { makeSearchSearchResults } from "@src/adapters/searchResultsSearchEngine/searchSearchResults";
import {
  SearchErrorCode,
  searchRequestUserDataCodec,
  SearchResponse,
} from "./models/search";
import { toSingleEither } from "@diogovasconcelos/lib/iots";

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

  const requestEither = toRequestWithUserData(
    logger,
    event,
    searchRequestUserDataCodec
  );
  if (isLeft(requestEither)) {
    return requestEither;
  }
  const request = requestEither.right;

  const isUsingKeywordsEither = await Promise.all(
    request.keywords.map(
      async (keyword) =>
        await isUserUsingKeyword(
          { logger, getSearchObjectsForUserFn },
          keyword,
          request.authData.id
        )
    )
  );
  if (isLeft(toSingleEither(isUsingKeywordsEither))) {
    return left(
      makeInternalErrorResponse("Failed to check if keyword is being used.")
    );
  }
  if (
    !isUsingKeywordsEither.some(
      (isUsingKeyword) => isRight(isUsingKeyword) && isUsingKeyword.right
    )
  ) {
    logger.error("One of the keywords is not used by user", {
      isUsingKeywordsEither,
    });
    return left(
      makeForbiddenResponse("Keyword not part of user's SearchObjects.")
    );
  }

  const searchResultEither = await searchSearchResultsFn(logger, request);
  if (isLeft(searchResultEither)) {
    return left(makeInternalErrorResponse("Failed to search."));
  }

  return right(makeSuccessResponse(200, searchResultEither.right));
};

export const lambdaHandler = apigwMiddlewareStack(handler);
