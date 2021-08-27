import { Callback, Context } from "aws-lambda";
import { right } from "fp-ts/lib/Either";
import logger from "@src/lib/logger";
import { makeSuccessResponse } from "@src/handlers/api/responses";
import { apigwMiddlewareStack } from "./apigwMiddleware";

describe("apigwMiddleware", () => {
  it("returns internal error on error", async () => {
    const mockHandler = jest.fn().mockImplementation(() => {
      throw new Error("error");
    });

    const apigwHandler = apigwMiddlewareStack(mockHandler);
    const result = await apigwHandler({}, {} as Context, {} as Callback);

    expect(result).toEqual(
      expect.objectContaining({
        statusCode: 500,
        body: expect.any(String),
      })
    );
    expect(JSON.parse(result.body)).toEqual(
      expect.objectContaining({
        errorCode: "INTERNAL_ERROR",
        errorMessage: expect.any(String),
      })
    );
  });

  it("adds CORS headers", async () => {
    const returnValue = makeSuccessResponse(200, { data: "ok" });

    const mockHandler = jest.fn().mockImplementation(() => {
      return right(returnValue);
    });

    const apigwHandler = apigwMiddlewareStack(mockHandler);
    const result = await apigwHandler({}, {} as Context, {} as Callback);

    logger.debug("result", { result });

    expect(result).toEqual(
      expect.objectContaining({
        statusCode: 200,
        body: expect.any(String),
      })
    );

    expect(result.headers["Access-Control-Allow-Origin"]).toEqual(
      expect.any(String)
    );
  });
});
