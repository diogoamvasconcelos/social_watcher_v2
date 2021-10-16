import * as t from "io-ts";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { isString } from "lodash";
import { User } from "@src/domain/models/user";
import { GetUserFn } from "@src/domain/ports/userStore/getUser";
import { Logger } from "@src/lib/logger";
import {
  ApiErrorResponse,
  ApiRequestMetadata,
  SearchObjectErrorCode,
  SearchObjectRequest,
} from "./models/models";
import {
  makeForbiddenResponse,
  makeInternalErrorResponse,
  makeNotFoundResponse,
  makeRequestMalformedResponse,
} from "./responses";
import { parseSafe } from "@diogovasconcelos/lib/json";
import { decode } from "@diogovasconcelos/lib/iots";
import {
  SearchObjectDomain,
  searchObjectIndexCodec,
} from "@src/domain/models/userItem";
import { JsonObjectEncodable } from "@diogovasconcelos/lib/models/jsonEncodable";
import { GetSearchObjectFn } from "@src/domain/ports/userStore/getSearchObject";

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
): Either<ApiErrorResponse<"INTERNAL_ERROR">, ApiRequestMetadata> => {
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
): Either<
  ApiErrorResponse<"INTERNAL_ERROR" | "REQUEST_MALFORMED">,
  U & ApiRequestMetadata
> => {
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

export const decodeBodyJSON = <U>({
  logger,
  body: jsonBody,
  decoder: bodyDecoder,
}: {
  logger: Logger;
  body: string | null;
  decoder: t.Decoder<unknown, U>;
}): Either<ApiErrorResponse<"REQUEST_MALFORMED">, U> => {
  const bodyEither = parseSafe(jsonBody);
  if (isLeft(bodyEither)) {
    logger.error("Failed to parse body to json.", { error: bodyEither.left });
    return left(
      makeRequestMalformedResponse("Request body is not a json file.")
    );
  }

  const dataEither = decode(bodyDecoder, bodyEither.right);
  if (isLeft(dataEither)) {
    logger.error("Failed to decode data's property of body.", {
      error: dataEither.left,
    });
    return left(makeRequestMalformedResponse("Request body is invalid."));
  }

  return dataEither;
};

export const buildApiRequestEvent = ({
  user,
  body,
  pathParameters,
}: {
  user: User;
  body?: JsonObjectEncodable;
  pathParameters?: JsonObjectEncodable;
}): APIGatewayProxyEvent => {
  return {
    requestContext: {
      authorizer: {
        claims: {
          sub: user.id,
          email: user.email,
        },
      },
    },
    body: JSON.stringify(body),
    pathParameters,
  } as unknown as APIGatewayProxyEvent;
};

// +++++++++++++++++
// + :SearchObject +
// +++++++++++++++++

export const toSearchObjectRequest = (
  logger: Logger,
  event: APIGatewayProxyEvent
): Either<ApiErrorResponse, SearchObjectRequest> => {
  const metadataEither = toApigwRequestMetadata(event);
  if (isLeft(metadataEither)) {
    return metadataEither;
  }

  const indexEither = decode(
    searchObjectIndexCodec,
    event.pathParameters?.index
  );
  if (isLeft(indexEither)) {
    logger.error("Failed to decode path paramters.", {
      error: indexEither.left,
    });
    return left(
      makeRequestMalformedResponse("Request pathParameters are invalid.")
    );
  }

  return right({ ...metadataEither.right, index: indexEither.right });
};

export const getExistingSearchObject = async ({
  logger,
  getSearchObjectFn,
  user,
  request,
}: {
  logger: Logger;
  getSearchObjectFn: GetSearchObjectFn;
  user: User;
  request: SearchObjectRequest;
}): Promise<
  Either<ApiErrorResponse<SearchObjectErrorCode>, SearchObjectDomain>
> => {
  if (request.index >= user.subscription.nofSearchObjects) {
    logger.error(
      `Trying to access a search object with index (${request.index}) higher than user's nofSearchObjects (${user.subscription.nofSearchObjects})`
    );
    return left(
      makeForbiddenResponse("Provided Search Object index is forbidden.")
    );
  }

  const existingSearchObjectEither = await getSearchObjectFn(
    logger,
    user.id,
    request.index
  );
  if (isLeft(existingSearchObjectEither)) {
    return left(
      makeInternalErrorResponse("Failed to get existing SearchObject.")
    );
  }
  if (existingSearchObjectEither.right === "NOT_FOUND") {
    return left(
      makeNotFoundResponse(
        `SearchObject with index:${request.index} does not exist`
      )
    );
  }

  return right(existingSearchObjectEither.right);
};
