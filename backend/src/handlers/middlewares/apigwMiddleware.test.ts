import { Callback, Context } from "aws-lambda";
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
});
