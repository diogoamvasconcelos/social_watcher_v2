import { domainToDocument } from "../../../../../src/adapters/keywordStore/client";
import { makeGetActiveKeywords } from "../../../../../src/adapters/keywordStore/getActiveKeywords";
import { KeywordData } from "../../../../../src/domain/models/keyword";
import { SocialMedia } from "../../../../../src/domain/models/socialMedia";
import { putItem } from "../../../../../src/lib/dynamoDb";
import { decode, fromEither, lowerCase } from "../../../../../src/lib/iots";
import { uuid } from "../../../../../src/lib/uuid";
import { client, preparesKeywordsTable } from "../../../../lib/dynamoDb";
import { getLoggerMock } from "../../../../lib/mocks";

describe("getActiveKeywords", () => {
  const logger = getLoggerMock();
  const tableName: string = uuid();
  const getActiveKeywordsFn = makeGetActiveKeywords(client, tableName);

  const putKeywordInTable = async (keywordData: KeywordData) => {
    return await putItem(
      client,
      {
        TableName: tableName,
        Item: domainToDocument(keywordData),
      },
      logger
    );
  };

  beforeEach(async () => {
    await preparesKeywordsTable(tableName);
    jest.resetAllMocks();
  });

  it("sparse global index works", async () => {
    const socialMedia: SocialMedia = "twitter";
    const activeKeyword: KeywordData = {
      keyword: fromEither(decode(lowerCase, "active_keyword")),
      status: "ENABLED",
      socialMedia,
    };
    const inactiveKeyword: KeywordData = {
      keyword: fromEither(decode(lowerCase, "inactive_keyword")),
      status: "DISABLED",
      socialMedia,
    };

    await putKeywordInTable(activeKeyword);
    await putKeywordInTable(inactiveKeyword);

    const result = fromEither(await getActiveKeywordsFn(logger, socialMedia));

    expect(result).toEqual([activeKeyword]);
  });
});
