import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { fromEither, newLowerCase } from "@diogovasconcelos/lib/iots";
import { PartialDeep } from "type-fest";
import { HackernewsSearchJob } from "@src/domain/models/searchJob";
import { buildSQSEvent } from "@test/lib/builders";
import { getEnvTestConfig } from "@test/lib/config";
import { invokeLambda } from "@test/lib/lambda";

jest.setTimeout(30000);

const lambdaName = getEnvTestConfig().searchHackernewsLambdaName;

describe("handler/searchHackernews", () => {
  it("can handle a hackernews search job", async () => {
    const searchJobEvent = buildHackernewsSearchJobEvent();

    const invokeResult = fromEither(
      await invokeLambda(lambdaName, searchJobEvent)
    );

    expect(invokeResult.StatusCode).toEqual(200);
  });
});

const buildHackernewsSearchJobEvent = (
  partialJob: PartialDeep<HackernewsSearchJob> = {}
) => {
  const searchJob: HackernewsSearchJob = deepmergeSafe(
    {
      socialMedia: "hackernews",
      keyword: newLowerCase("diogo vasconcelos"),
    },
    partialJob
  );
  return buildSQSEvent([searchJob]);
};
