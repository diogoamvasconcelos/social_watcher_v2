import _ from "lodash";
import { Callback, Context, Handler } from "aws-lambda";
import logger from "@src/lib/logger";
import { JsonEncodable } from "@diogovasconcelos/lib/models/jsonEncodable";

export type Middleware = <T, U>(handler: Handler<T, U>) => Handler;
export const stackMiddlewares = (
  middlewares: Middleware[],
  handler: Handler
) => {
  return middlewares.reduceRight<Handler>(
    (handler, middleware) => middleware(handler),
    handler
  );
};

export type LoggerMiddlewareUpdateFn = (event: JsonEncodable) => JsonEncodable;
export const makeLoggerMiddleware =
  (updateEventFns?: LoggerMiddlewareUpdateFn[]): Middleware =>
  <T, U>(handler: Handler<T, U>) => {
    return async (event: T, context: Context, callback: Callback<U>) => {
      const eventCopy = _.cloneDeep(event) as unknown as JsonEncodable;

      logger.resetContext();
      logger.addToContext({
        functionName: context.functionName,
        functionVersion: context.functionVersion,
        invokedFunctionArn: context.invokedFunctionArn,
        memoryLimitInMB: context.memoryLimitInMB,
        awsRequestId: context.awsRequestId,
        logGroupName: context.logGroupName,
        logStreamName: context.logStreamName,
        callbackWaitsForEmptyEventLoop: context.callbackWaitsForEmptyEventLoop,
        event: updateEventFns
          ? updateEventFns.reduce((arg, fn) => fn(arg), eventCopy)
          : eventCopy,
      });
      logger.info("Entering lambda execution.");
      const result = await handler(event, context, callback);
      if (result) {
        logger.info("Lambda finished.", {
          returnValue: result,
        });
      }

      return result;
    };
  };

export type ErrorMiddlewareErrorReturnFn = (error: unknown) => unknown;
export const makeErrorCatchMiddleware =
  (errorReturnFn?: ErrorMiddlewareErrorReturnFn): Middleware =>
  <T, U>(handler: Handler<T, U>) => {
    return async (event: T, context: Context, callback: Callback<U>) => {
      try {
        return await handler(event, context, callback);
      } catch (error) {
        logger.error("Unhandled error by lambda", {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        });

        if (errorReturnFn) {
          return errorReturnFn(error);
        }

        throw error;
      }
    };
  };

export const defaultMiddlewareStack: Middleware = <T, U>(
  handler: Handler<T, U>
) => {
  return stackMiddlewares(
    [makeLoggerMiddleware(), makeErrorCatchMiddleware()],
    handler
  );
};
