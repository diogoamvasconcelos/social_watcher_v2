import { uuid } from "../lib/uuid";
import { KeywordData } from "../domain/models/keyword";
import { SocialMedia } from "../domain/models/socialMedia";
import { DateISOString, newLowerCase } from "@diogovasconcelos/lib/iots";
import _ from "lodash";
import { filterKeywords } from "./dispatchSearchJobs";
import { getHoursAgo } from "../lib/date";

describe("dispatchSearchJobs", () => {
  describe("filterKeywords", () => {
    it("limits instagram to 10 keywords/searchobjects", () => {
      const keywords = _.range(20).map(() =>
        buildRandomKeywordData("instagram")
      );

      const filteredKeywords = filterKeywords("instagram", keywords);

      expect(filteredKeywords).toHaveLength(10);
    });

    it("filters keywords still in cooldown", () => {
      const keywords = [
        buildRandomKeywordData("instagram", getHoursAgo(2)), // within cooldown
        buildRandomKeywordData("instagram", getHoursAgo(25)), // outside of cooldown
      ];

      const filteredKeywords = filterKeywords("instagram", keywords);

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
