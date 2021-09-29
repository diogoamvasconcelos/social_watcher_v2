import { PartialDeep } from "type-fest";
import { YoutubeSearchJob } from "@src/domain/models/searchJob";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { fromEither, newLowerCase } from "@diogovasconcelos/lib/iots";
import { buildSQSEvent } from "@test/lib/builders";
import { getEnvTestConfig } from "@test/lib/config";
import { invokeLambda } from "@test/lib/lambda";

jest.setTimeout(30000);

const lambdaName = getEnvTestConfig().searchYoutubeLambdaName;

describe("handler/searchYoutube", () => {
  it("can handle a youtube search job", async () => {
    const searchJobEvent = buildYoutubeSearchJobEvent();

    const invokeResult = fromEither(
      await invokeLambda(lambdaName, searchJobEvent)
    );

    expect(invokeResult.StatusCode).toEqual(200);
  });
});

const buildYoutubeSearchJobEvent = (
  partialJob: PartialDeep<YoutubeSearchJob> = {}
) => {
  const searchJob: YoutubeSearchJob = deepmergeSafe(
    {
      socialMedia: "youtube",
      keyword: newLowerCase("diogo vasconcelos"),
    },
    partialJob
  );
  return buildSQSEvent([searchJob]);
};
