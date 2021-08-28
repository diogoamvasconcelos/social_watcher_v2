import { PartialDeep } from "type-fest";
import { TwitterSearchJob } from "@src/domain/models/searchJob";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { fromEither, newLowerCase } from "@diogovasconcelos/lib/iots";
import { buildSQSEvent } from "@test/lib/builders";
import { getEnvTestConfig } from "@test/lib/config";
import { invokeLambda } from "@test/lib/lambda";

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
  partialJob: PartialDeep<TwitterSearchJob> = {}
) => {
  const searchJob: TwitterSearchJob = deepmergeSafe(
    {
      socialMedia: "twitter",
      keyword: newLowerCase("diogo vasconcelos"),
    },
    partialJob
  );
  return buildSQSEvent([searchJob]);
};
