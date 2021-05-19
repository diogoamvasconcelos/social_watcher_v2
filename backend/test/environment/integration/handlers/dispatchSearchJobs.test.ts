import { fromEither } from "@shared/lib/src/iots";
import { getEnvTestConfig } from "../../../lib/config";
import { invokeLambda } from "../../../lib/lambda";

const lambdaName = getEnvTestConfig().dispatchSearchJobsLambdaName;

describe("handler/dispatchSearchJobs", () => {
  beforeAll(async () => {
    jest.setTimeout(10000);
  });

  it("can fetch active search jobs", async () => {
    const invokeResult = fromEither(await invokeLambda(lambdaName, {}));

    expect(invokeResult.StatusCode).toEqual(200);
  });
});
