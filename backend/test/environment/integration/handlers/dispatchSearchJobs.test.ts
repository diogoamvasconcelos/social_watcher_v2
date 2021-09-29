import { fromEither } from "@diogovasconcelos/lib/iots";
import { getEnvTestConfig } from "@test/lib/config";
import { invokeLambda } from "@test/lib/lambda";

jest.setTimeout(10000);

const lambdaName = getEnvTestConfig().dispatchSearchJobsLambdaName;

describe("handler/searchers/dispatchSearchJobsHandler", () => {
  it("can fetch active search jobs", async () => {
    const invokeResult = fromEither(await invokeLambda(lambdaName, {}));

    expect(invokeResult.StatusCode).toEqual(200);
  });
});
