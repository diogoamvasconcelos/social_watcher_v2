import { EmailReportJob } from "@src/domain/models/reportJob";
import { buildSearchResult, buildSQSEvent } from "@test/lib/builders";
import { getEnvTestConfig } from "@test/lib/config";
import {
  fromEither,
  newEmailFromString,
  newLowerCase,
} from "@diogovasconcelos/lib/iots";
import { invokeLambda } from "@test/lib/lambda";
import { getNow } from "@src/lib/date";

jest.setTimeout(30000);

const lambdaName = getEnvTestConfig().reportEmailLambdaName;

describe("handlers/reportEmail", () => {
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
    searchStart: getNow(),
  };

  return buildSQSEvent([reportJob]);
};
