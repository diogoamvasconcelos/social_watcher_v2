/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayProxyResult, Callback, Context, Handler } from "aws-lambda";
import { isLeft, left } from "fp-ts/lib/Either";
import { ApiResponse } from "../api/models/models";
import { makeInternalErrorResponse } from "../api/responses";
import {
  ErrorMiddlewareErrorReturnFn,
  LoggerMiddlewareUpdateFn,
  makeErrorCatchMiddleware,
  makeLoggerMiddleware,
  Middleware,
  stackMiddlewares,
} from "./common";

const removeAuthorization: LoggerMiddlewareUpdateFn = (event) => {
  if (event) {
    if ((event as any).headers) {
      delete (event as any).headers.Authorization;
    }
    if ((event as any).multiValueHeaders) {
      delete (event as any).multiValueHeaders.Authorization;
    }
  }

  return event;
};

const removeMultiValueHeaders: LoggerMiddlewareUpdateFn = (event) => {
  if ((event as any).multiValueHeaders) {
    delete (event as any).multiValueHeaders;
  }

  return event;
};

const errorToInternalError: ErrorMiddlewareErrorReturnFn = (_error) => {
  return apigwResponseToApigwResult(
    left(makeInternalErrorResponse("Unexpected error occured."))
  );
};

const apigwResponseToApigwResult = (
  response: ApiResponse
): APIGatewayProxyResult => {
  const defaultHeaders = {
    "Strict-Transport-Security": [
      "max-age=63072000",
      "includeSubdomains",
      "preload",
    ].join(";"),
    "Content-Security-Policy": [
      "default-src 'none'",
      "img-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "object-src 'none'",
    ].join(";"),
    "Referrer-Policy": "same-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Access-Control-Allow-Origin": "*",
  };

  if (isLeft(response)) {
    const error = response.left;
    return {
      statusCode: error.statusCode,
      headers: defaultHeaders,
      body: JSON.stringify(error),
    };
  }

  const success = response.right;
  return {
    statusCode: success.statusCode,
    headers: defaultHeaders,
    body: success.body ? JSON.stringify(success.body) : "",
  };
};

const toApigwMiddleware: Middleware = <T>(handler: Handler) => {
  return async (event: T, context: Context, callback: Callback) => {
    const result = await handler(event, context, callback);
    if (result) {
      return apigwResponseToApigwResult(result);
    }
  };
};

export const apigwMiddlewareStack: Middleware = <T, U>(
  handler: Handler<T, U>
) => {
  return stackMiddlewares(
    [
      makeLoggerMiddleware([removeAuthorization, removeMultiValueHeaders]),
      makeErrorCatchMiddleware(errorToInternalError),
      toApigwMiddleware,
    ],
    handler
  );
};
