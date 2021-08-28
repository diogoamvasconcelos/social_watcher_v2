import { keywordDataToDocument } from "@src/adapters/keywordStore/client";
import { makeGetActiveKeywords } from "@src/adapters/keywordStore/getActiveKeywords";
import { KeywordData } from "@src/domain/models/keyword";
import { SocialMedia } from "@src/domain/models/socialMedia";
import { putItem } from "@src/lib/dynamoDb";
import { fromEither, newLowerCase } from "@diogovasconcelos/lib/iots";
import { getLogger } from "@src/lib/logger";
import { uuid } from "@src/lib/uuid";
import { client, preparesGenericTable } from "@test/lib/dynamoDb";

describe("getActiveKeywords", () => {
  const logger = getLogger();
  const tableName: string = uuid();

  const getActiveKeywordsFn = makeGetActiveKeywords(client, tableName);

  const putKeywordInTable = async (keywordData: KeywordData) => {
    return await putItem(
      client,
      {
        TableName: tableName,
        Item: keywordDataToDocument(keywordData),
      },
      logger
    );
  };

  beforeAll(() => {
    jest.setTimeout(45000);
  });

  beforeEach(async () => {
    await preparesGenericTable(tableName);
  });

  it("sparse global index works", async () => {
    const socialMedia: SocialMedia = "twitter";
    const activeKeyword: KeywordData = {
      keyword: newLowerCase("active_keyword"),
      status: "ACTIVE",
      socialMedia,
    };
    const inactiveKeyword: KeywordData = {
      keyword: newLowerCase("inactive_keyword"),
      status: "INACTIVE",
      socialMedia,
    };

    await putKeywordInTable(activeKeyword);
    await putKeywordInTable(inactiveKeyword);

    const result = fromEither(await getActiveKeywordsFn(logger, socialMedia));

    expect(result).toEqual([activeKeyword]);
  });
});
