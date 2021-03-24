import { Callback, Context, Handler } from "aws-lambda";
import logger from "../../lib/logger";
import { JsonEncodable } from "../../lib/models/jsonEncodable";

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

const loggerMiddleware: Middleware = <T, U>(handler: Handler<T, U>) => {
  return async (event: T, context: Context, callback: Callback<U>) => {
    logger.createContext({
      functionName: context.functionName,
      functionVersion: context.functionVersion,
      invokedFunctionArn: context.invokedFunctionArn,
      memoryLimitInMB: context.memoryLimitInMB,
      awsRequestId: context.awsRequestId,
      logGroupName: context.logGroupName,
      logStreamName: context.logStreamName,
      callbackWaitsForEmptyEventLoop: context.callbackWaitsForEmptyEventLoop,
      event: (event as unknown) as JsonEncodable,
    });
    logger.info("Entering lambda execution.");
    const result = await handler(event, context, callback);
    if (result != undefined) {
      logger.info("Lambda finished.", {
        returnValue: (result as unknown) as JsonEncodable,
      });
    }
    logger.resetContext();
    return result;
  };
};

const errorMiddleware: Middleware = <T, U>(handler: Handler<T, U>) => {
  return async (event: T, context: Context, callback: Callback<U>) => {
    try {
      return await handler(event, context, callback);
    } catch (error) {
      logger.error("Unhandled error by lambda", {
        // Need to select because the Error type issues
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      });
    }
  };
};

export const defaultOutLayerMiddleware: Middleware = <T, U>(
  handler: Handler<T, U>
) => {
  return stackMiddlewares([loggerMiddleware, errorMiddleware], handler);
};
