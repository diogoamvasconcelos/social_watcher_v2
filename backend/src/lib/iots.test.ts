import { isRight } from "fp-ts/lib/Either";
import { decode, lowerCase } from "./iots";

describe("lowercase", () => {
  const testCases: [string, string, boolean][] = [
    ["a lower case string", "lower_case_string", true],
    ["a lower case string2", "low3r case string", true],
    ["a number only string", "000-000-0000-0001", true],
    ["a Upper case string", "UPPER_CASE_STRING", false],
    ["a mixed case string", "Mixed_case_string", false],
    ["a mixed case string2", "mixed cAse string", false],
  ];

  test.each(testCases)(
    "decode %p as lowercase?",
    (_title: string, s: string, isLowerCase: boolean) => {
      const decodeResult = decode(lowerCase, s);
      expect(isRight(decodeResult)).toEqual(isLowerCase);
    }
  );
});
