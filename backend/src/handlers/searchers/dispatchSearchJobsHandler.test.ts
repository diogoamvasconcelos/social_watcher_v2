import { uuid } from "@src/lib/uuid";
import { KeywordData } from "@src/domain/models/keyword";
import { SocialMedia } from "@src/domain/models/socialMedia";
import { DateISOString, newLowerCase } from "@diogovasconcelos/lib/iots";
import _ from "lodash";
import { filterKeywords } from "./dispatchSearchJobsHandler";
import { getHoursAgo } from "@src/lib/date";

describe("dispatchSearchJobs", () => {
  describe("filterKeywords", () => {
    it.skip("limits instagram to 10 keywords/searchobjects", () => {
      const keywords = _.range(20).map(() =>
        buildRandomKeywordData("instagram")
      );

      const filteredKeywords = filterKeywords("instagram", keywords);

      expect(filteredKeywords).toHaveLength(10);
    });

    it("filters keywords still in cooldown", () => {
      const keywords = [
        buildRandomKeywordData("youtube", getHoursAgo(2)), // within cooldown
        buildRandomKeywordData("youtube", getHoursAgo(25)), // outside of cooldown
      ];

      const filteredKeywords = filterKeywords("youtube", keywords);

      expect(filteredKeywords).toHaveLength(1);
      expect(filteredKeywords[0]).toEqual(keywords[1]);
    });
  });
});

const buildRandomKeywordData = (
  socialMedia: SocialMedia,
  searchedAt?: DateISOString
): KeywordData => ({
  socialMedia,
  status: "ACTIVE",
  keyword: newLowerCase(uuid().toString()),
  searchedAt,
});
