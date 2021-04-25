import { APIGatewayProxyEvent } from "aws-lambda";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { isString } from "lodash";
import { User } from "../../domain/models/user";
import { GetUserFn } from "../../domain/ports/userStore/getUser";
import { Logger } from "../../lib/logger";
import { ApiErrorResponse, ApiRequestMetadata } from "./models/models";
import { makeInternalErrorResponse } from "./responses";

export const apiGetUser = async ({
  logger,
  getUserFn,
  request,
}: {
  logger: Logger;
  getUserFn: GetUserFn;
  request: ApiRequestMetadata;
}): Promise<Either<ApiErrorResponse<"INTERNAL_ERROR">, User>> => {
  const userEither = await getUserFn(logger, request.authData.id);
  if (isLeft(userEither)) {
    return left(makeInternalErrorResponse("Error trying to get user."));
  }

  if (userEither.right == "NOT_FOUND") {
    return left(
      makeInternalErrorResponse(`User (id=${request.authData.id}) not found.`)
    );
  }

  return right(userEither.right);
};

export const toApigwRequestMetadata = (
  event: APIGatewayProxyEvent
): Either<ApiErrorResponse, ApiRequestMetadata> => {
  const id: string | undefined = event.requestContext.authorizer?.claims?.sub;
  const email: string | undefined =
    event.requestContext.authorizer?.claims?.email;
  if (!isString(id) || !isString(email)) {
    return left(
      makeInternalErrorResponse("Failed to get userdata from apigw event")
    );
  }

  return right({ authData: { id, email } });
};
