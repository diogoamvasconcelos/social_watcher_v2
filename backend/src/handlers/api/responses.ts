import { JsonObjectEncodable } from "@diogovasconcelos/lib/models/jsonEncodable";
import { ApiErrorResponse, ApiSuccessResponse } from "./models/models";

export const makeSuccessResponse = <B extends JsonObjectEncodable>(
  statusCode: number,
  body: B
): ApiSuccessResponse<B> => ({
  statusCode,
  body,
});

export const makeInternalErrorResponse = (
  errorMessage: string
): ApiErrorResponse<"INTERNAL_ERROR"> => ({
  statusCode: 500,
  errorCode: "INTERNAL_ERROR",
  errorMessage,
});

export const makeNotFoundResponse = (
  errorMessage: string
): ApiErrorResponse<"NOT_FOUND"> => ({
  statusCode: 404,
  errorCode: "NOT_FOUND",
  errorMessage,
});

export const makeBadRequestResponse = <T extends string>(
  errorCode: T,
  errorMessage: string
): ApiErrorResponse<T> => ({
  statusCode: 400,
  errorCode,
  errorMessage,
});

export const makeRequestMalformedResponse = (
  errorMessage: string
): ApiErrorResponse<"REQUEST_MALFORMED"> =>
  makeBadRequestResponse("REQUEST_MALFORMED", errorMessage);

export const makeUnauthorizedResponse = (
  errorMessage: string
): ApiErrorResponse<"UNAUTHORIZED"> => ({
  statusCode: 401,
  errorCode: "UNAUTHORIZED",
  errorMessage,
});

export const makeForbiddenResponse = (
  errorMessage: string
): ApiErrorResponse<"FORBIDDEN"> => ({
  statusCode: 403,
  errorCode: "FORBIDDEN",
  errorMessage,
});
