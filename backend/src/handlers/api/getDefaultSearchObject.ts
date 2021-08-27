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

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiResponse<GetSearchObjectErrorCode, GetSearchObjectResponse>> => {
  const requestEither = toApigwRequestMetadata(event);
  if (isLeft(requestEither)) {
    return requestEither;
  }

  const defaultSearchObject: SearchObjectDomain = {
    ...searchObjectUserDataIoToDomain({
      keyword: newLowerCase("placeholder keyword"),
    }),
    type: "SEARCH_OBJECT",
    id: requestEither.right.authData.id,
    index: newPositiveInteger(0),
    lockedStatus: "LOCKED",
  };

  return right(makeSuccessResponse(200, defaultSearchObject));
};

export const lambdaHandler = apigwMiddlewareStack(handler);
