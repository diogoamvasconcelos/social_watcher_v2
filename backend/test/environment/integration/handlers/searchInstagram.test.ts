import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { fromEither, newLowerCase } from "@diogovasconcelos/lib/iots";
import { PartialDeep } from "type-fest";
import { InstagramSearchJob } from "@src/domain/models/searchJob";
import { buildSQSEvent } from "@test/lib/builders";
import { getEnvTestConfig } from "@test/lib/config";
import { invokeLambda } from "@test/lib/lambda";

jest.setTimeout(30000);

const lambdaName = getEnvTestConfig().searchInstagramLambdaName;

describe("handler/searchInstagram", () => {
  // TODO: skip for now because https://rapidapi.com/restyler/api/instagram40 is offline, so the custom proxy fails
  it.skip("can handle a instagram search job", async () => {
    const searchJobEvent = buildInstagramSearchJobEvent();

    const invokeResult = fromEither(
      await invokeLambda(lambdaName, searchJobEvent)
    );

    expect(invokeResult.StatusCode).toEqual(200);
  });
});

const buildInstagramSearchJobEvent = (
  partialJob: PartialDeep<InstagramSearchJob> = {}
) => {
  const searchJob: InstagramSearchJob = deepmergeSafe(
    {
      socialMedia: "instagram",
      keyword: newLowerCase("diogo vasconcelos"),
    },
    partialJob
  );
  return buildSQSEvent([searchJob]);
};
