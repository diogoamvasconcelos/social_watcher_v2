import { isRight } from "fp-ts/lib/Either";
import { DateFromISOStringV2, decode, lowerCase } from "./iots";

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

describe("DateFromStringV2", () => {
  const testCases: [string, string | Date, boolean][] = [
    ["short date (no time)", "2020-10-20", true],
    ["ISO8061 timestmap", "2020-10-20T00:00:00.000Z", true],
    ["a date object", new Date(), true],
    ["just the time", "00:00:00", false],
    ["string that is not a date", "not a date", false],
  ];

  test.each(testCases)(
    "decode %p as date?",
    (_title: string, u: string | Date, isDate: boolean) => {
      const decodeResult = decode(DateFromISOStringV2, u);
      expect(isRight(decodeResult)).toEqual(isDate);
    }
  );
});
