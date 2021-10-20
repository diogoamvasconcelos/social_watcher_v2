import { APIGatewayProxyEvent } from "aws-lambda";
import { ApiResponse } from "./models/models";
import { isLeft, right } from "fp-ts/lib/Either";
import { makeSuccessResponse } from "./responses";
import { apigwMiddlewareStack } from "@src/handlers/middlewares/apigwMiddleware";
import { toApigwRequestMetadata } from "./shared";
import {
  GetSearchObjectErrorCode,
  GetSearchObjectResponse,
} from "./models/getSearchObject";
import {
  SearchObjectDomain,
  searchObjectUserDataIoToDomain,
} from "@src/domain/models/userItem";
import { newLowerCase, newPositiveInteger } from "@diogovasconcelos/lib/iots";
import { getNow } from "@src/lib/date";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiResponse<GetSearchObjectErrorCode, GetSearchObjectResponse>> => {
  const metadataEither = toApigwRequestMetadata(event);
  if (isLeft(metadataEither)) {
    return metadataEither;
  }

  const defaultSearchObject: SearchObjectDomain = {
    ...searchObjectUserDataIoToDomain({
      keyword: newLowerCase("placeholder keyword"),
    }),
    type: "SEARCH_OBJECT",
    id: metadataEither.right.authData.id,
    index: newPositiveInteger(0),
    lockedStatus: "LOCKED",
    createdAt: getNow(),
  };

  return right(makeSuccessResponse(200, defaultSearchObject));
};

export const lambdaHandler = apigwMiddlewareStack(handler);
