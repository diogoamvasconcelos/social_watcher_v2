import { Callback, Context } from "aws-lambda";
import {
  makeErrorCatchMiddleware,
  makeLoggerMiddleware,
  Middleware,
  stackMiddlewares,
} from "./common";
import logger from "@src/lib/logger";

jest.mock("@src/lib/logger");

describe("stackMiddlewares", () => {
  it("applies from left to right", async () => {
    const mockBefore1 = jest.fn();
    const mockAfter1 = jest.fn();
    const middleware1: Middleware =
      (handler) => async (event, context, callback) => {
        mockBefore1();
        await handler(event, context, callback);
        mockAfter1();
      };

    const mockBefore2 = jest.fn();
    const mockAfter2 = jest.fn();
    const middleware2: Middleware =
      (handler) => async (event, context, callback) => {
        mockBefore2();
        await handler(event, context, callback);
        mockAfter2();
      };

    const mockHandler = jest.fn();
    const stack = stackMiddlewares([middleware1, middleware2], mockHandler);

    await stack({}, {} as Context, {} as Callback);

    expect(mockBefore1).toHaveBeenCalledTimes(1);
    expect(mockAfter1).toHaveBeenCalledTimes(1);
    expect(mockBefore2).toHaveBeenCalledTimes(1);
    expect(mockAfter2).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledTimes(1);
    // https://github.com/jest-community/jest-extended#tohavebeencalledbefore
    expect(mockBefore1).toHaveBeenCalledBefore(mockBefore2);
    expect(mockBefore2).toHaveBeenCalledBefore(mockHandler);
    expect(mockHandler).toHaveBeenCalledBefore(mockAfter2);
    expect(mockAfter2).toHaveBeenCalledBefore(mockAfter1);
  });
});

describe("loggerMiddleware", () => {
  it("logs before execution and adds to context", async () => {
    const mockHandler = jest.fn();

    await makeLoggerMiddleware()(mockHandler)(
      {},
      {} as Context,
      {} as Callback
    );

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith("Entering lambda execution.");
    expect(logger.resetContext).toHaveBeenCalledTimes(1);
  });

  it("logs return value", async () => {
    const returnValue = { data: "some-data" };
    const mockHandler = jest.fn().mockReturnValue(returnValue);

    await makeLoggerMiddleware()(mockHandler)(
      {},
      {} as Context,
      {} as Callback
    );

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(expect.any(String), {
      returnValue,
    });
  });
});

describe("errorCatchMiddleware", () => {
  it("logs error, and throws error (no errorReturnFn given)", async () => {
    const error = new Error("error");
    const mockHandler = jest.fn(async () => {
      throw error;
    });

    await expect(
      makeErrorCatchMiddleware()(mockHandler)({}, {} as Context, {} as Callback)
    ).rejects.toThrowError(error);

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(expect.any(String), {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
  });

  it("returns value when errorReturnFn is given", async () => {
    const error = new Error("error");
    const mockHandler = jest.fn(async () => {
      throw error;
    });

    const returnValue = await makeErrorCatchMiddleware((error: unknown) => ({
      gotError: error,
    }))(mockHandler)({}, {} as Context, {} as Callback);

    expect(returnValue).toEqual({ gotError: error });
  });
});
