import { EmailReportJob } from "../../../../src/domain/models/reportJob";
import { buildSearchResult, buildSQSEvent } from "../../../lib/builders";
import { getEnvTestConfig } from "../../../lib/config";
import {
  fromEither,
  newEmailFromString,
  newLowerCase,
} from "@diogovasconcelos/lib/iots";
import { invokeLambda } from "../../../lib/lambda";

const lambdaName = getEnvTestConfig().reportEmailLambdaName;

describe("handlers/reportEmail", () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
  });

  it("can report an email", async () => {
    const searchJobEvent = buildEmailReportJobEvent();

    const invokeResult = fromEither(
      await invokeLambda(lambdaName, searchJobEvent)
    );

    expect(invokeResult.StatusCode).toEqual(200);
  });
});

const buildEmailReportJobEvent = () => {
  const reportJob: EmailReportJob = {
    reportMedium: "email",
    keyword: newLowerCase("test-keyword"),
    searchResults: [buildSearchResult()],
    searchFrequency: "DAILY",
    config: {
      status: "DAILY",
      addresses: [newEmailFromString("success@simulator.amazonses.com")],
    },
  };

  return buildSQSEvent([reportJob]);
};
