import { fromEither } from "../../../../src/lib/iots";
import { getEnvTestConfig } from "../../../lib/config";
import { invokeLambda } from "../../../lib/lambda";

const lambdaName = getEnvTestConfig().dispatchSearchJobsLambdaName;

describe("handler/dispatchSearchJobs", () => {
  it("can fetch active search jobs", async () => {
    const invokeResult = fromEither(await invokeLambda(lambdaName, {}));

    expect(invokeResult.StatusCode).toEqual(200);
  });
});
