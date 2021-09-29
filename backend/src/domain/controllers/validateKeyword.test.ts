import _ from "lodash";
import { newLowerCase } from "@diogovasconcelos/lib/iots";
import { uuid } from "@src/lib/uuid";
import { left, right } from "fp-ts/lib/Either";
import { Keyword } from "../models/keyword";
import { keywordLimits, validateKeyword } from "./validateKeyword";

describe("controllers/validateKeyword", () => {
  const testCases: [string, Keyword, ReturnType<typeof validateKeyword>][] = [
    ["simple word", newLowerCase("word"), right("OK")],
    ["2 words", newLowerCase("word word"), right("OK")],
    [
      "max words",
      newLowerCase(
        _.times(keywordLimits.words, (_: number) => "word").join(" ")
      ),
      right("OK"),
    ],
    [
      "more than max words",
      newLowerCase(
        _.times(keywordLimits.words + 1, (_: number) => "word").join(" ")
      ),
      left("TOO_MANY_WORDS"),
    ],
    ["starts with space", newLowerCase(" word"), left("STARTS_WITH_SPACE")],
    ["ends with space", newLowerCase("word "), left("ENDS_WITH_SPACE")],
    ["starts with #", newLowerCase("#word"), right("OK")],
    ["has simbols", newLowerCase("simbols-!#$%^&*()@"), right("OK")],
    [
      "almost a long word",
      newLowerCase("a".repeat(keywordLimits.length)),
      right("OK"),
    ],
    [
      "very long word",
      newLowerCase("a".repeat(keywordLimits.length + 1)),
      left("TOO_LONG"),
    ],
    ["uuid is fine (used in tests)", newLowerCase(uuid()), right("OK")],
  ];

  test.each(testCases)(
    "%p validateKeyword test",
    async (
      _title: string,
      keyword: Keyword,
      expectsOutput: ReturnType<typeof validateKeyword>
    ) => {
      const isValid = validateKeyword(keyword);
      expect(isValid).toEqual(expectsOutput);
    }
  );
});
