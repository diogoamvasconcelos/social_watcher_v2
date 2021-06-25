import * as t from "io-ts";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { isString } from "lodash";
import { User } from "../../domain/models/user";
import { GetUserFn } from "../../domain/ports/userStore/getUser";
import { Logger } from "../../lib/logger";
import { ApiErrorResponse, ApiRequestMetadata } from "./models/models";
import {
  makeInternalErrorResponse,
  makeRequestMalformedResponse,
} from "./responses";
import { parseSafe } from "@diogovasconcelos/lib/json";
import { decode } from "@diogovasconcelos/lib/iots";

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

export const toRequestWithUserData = <U>(
  logger: Logger,
  event: APIGatewayProxyEvent,
  userDataDecoder: t.Decoder<unknown, U>
): Either<ApiErrorResponse, U & ApiRequestMetadata> => {
  const metadataEither = toApigwRequestMetadata(event);
  if (isLeft(metadataEither)) {
    return metadataEither;
  }

  const bodyEither = parseSafe(event.body);
  if (isLeft(bodyEither)) {
    logger.error("Failed to parse body to json.", { error: bodyEither.left });
    return left(
      makeRequestMalformedResponse("Request body is not a json file.")
    );
  }
  const body = bodyEither.right;

  const userDataEither = decode(userDataDecoder, body);
  if (isLeft(userDataEither)) {
    return left(makeRequestMalformedResponse("Request body is invalid."));
  }

  return right({
    ...metadataEither.right,
    ...userDataEither.right,
  });
};
