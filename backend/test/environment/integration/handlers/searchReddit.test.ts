import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { fromEither, newLowerCase } from "@diogovasconcelos/lib/iots";
import { PartialDeep } from "type-fest";
import { RedditSearchJob } from "../../../../src/domain/models/searchJob";
import { buildSQSEvent } from "../../../lib/builders";
import { getEnvTestConfig } from "../../../lib/config";
import { invokeLambda } from "../../../lib/lambda";

const lambdaName = getEnvTestConfig().searchRedditLambdaName;

describe("handler/searchReddit", () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
  });

  it("can handle a reddit search job", async () => {
    const searchJobEvent = buildRedditSearchJobEvent();

    const invokeResult = fromEither(
      await invokeLambda(lambdaName, searchJobEvent)
    );

    expect(invokeResult.StatusCode).toEqual(200);
  });
});

const buildRedditSearchJobEvent = (
  partialJob: PartialDeep<RedditSearchJob> = {}
) => {
  const searchJob: RedditSearchJob = deepmergeSafe(
    {
      socialMedia: "reddit",
      keyword: newLowerCase("diogo vasconcelos"),
    },
    partialJob
  );
  return buildSQSEvent([searchJob]);
};
