import "jest-extended";
import { fromEither, newLowerCase } from "@diogovasconcelos/lib/iots";
import { uuid } from "../../lib/uuid";
import { getLogger } from "../../lib/logger";
import { KeywordData } from "../models/keyword";
import { GetActiveKeywordsFn } from "../ports/keywordStore/getActiveKeywords";
import { getAllActiveKeywords } from "./getAllActiveKeywords";
import _ from "lodash";
import { socialMedias } from "../models/socialMedia";
import { right } from "fp-ts/lib/Either";

const logger = getLogger();
const getActiveKeywordsFnMocked =
  jest.fn() as jest.MockedFunction<GetActiveKeywordsFn>;

describe("getAllActiveKeywords", () => {
  beforeEach(() => {
    getActiveKeywordsFnMocked.mockReset();
  });

  it("can dedup keywords", async () => {
    const randomKeywordData: KeywordData[] = _.range(10).map((_) => ({
      keyword: newLowerCase(uuid()),
      status: "ACTIVE",
      socialMedia: "twitter",
    }));

    for (let i = 0; i < socialMedias.length; ++i) {
      if (i == 0) {
        // return the full list
        getActiveKeywordsFnMocked.mockResolvedValueOnce(
          right(randomKeywordData)
        );
      } else {
        // return random sample of original list
        getActiveKeywordsFnMocked.mockResolvedValueOnce(
          right(
            _.sampleSize(
              randomKeywordData,
              Math.random() * randomKeywordData.length
            )
          )
        );
      }
    }

    const keywords = fromEither(
      await getAllActiveKeywords({
        logger,
        getActiveKeywordsFn: getActiveKeywordsFnMocked,
      })
    );

    expect(keywords).toIncludeAllMembers(
      randomKeywordData.map((keywordData) => keywordData.keyword)
    );
  });
});
