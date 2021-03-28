import deepmerge from "deepmerge";
import { TwitterSearchJob } from "../../../../src/domain/models/searchJobs";
import { fromEither } from "../../../../src/lib/iots";
import { buildSQSEvent } from "../../../lib/builders";
import { getEnvTestConfig } from "../../../lib/config";
import { invokeLambda } from "../../../lib/lambda";

const lambdaName = getEnvTestConfig().searchTwitterLambdaName;

describe("handler/searchTwitter", () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
  });

  it("can handle a twitter search job", async () => {
    const searchJobEvent = buildTwitterSearchJobEvent();

    const invokeResult = fromEither(
      await invokeLambda(lambdaName, searchJobEvent)
    );

    expect(invokeResult.StatusCode).toEqual(200);
  });
});

const buildTwitterSearchJobEvent = (
  partialJob: Partial<TwitterSearchJob> = {}
) => {
  const searchJob: TwitterSearchJob = deepmerge(partialJob, {
    socialMedia: "twitter",
    keyword: "test",
  });
  return buildSQSEvent([searchJob]);
};
