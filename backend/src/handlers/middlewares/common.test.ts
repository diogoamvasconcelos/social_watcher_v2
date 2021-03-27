import "jest-extended";
import { Callback, Context } from "aws-lambda";
import { Middleware, stackMiddlewares } from "./common";

describe("stackMiddlewares", () => {
  it("applies from left to right", async () => {
    const mockBefore1 = jest.fn();
    const mockAfter1 = jest.fn();
    const middleware1: Middleware = (handler) => async (
      event,
      context,
      callback
    ) => {
      mockBefore1();
      await handler(event, context, callback);
      mockAfter1();
    };

    const mockBefore2 = jest.fn();
    const mockAfter2 = jest.fn();
    const middleware2: Middleware = (handler) => async (
      event,
      context,
      callback
    ) => {
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

// logger middleware
