import { Either, isRight, left, right } from "fp-ts/lib/Either";
import {
  DateFromISOStringV2,
  dateISOString,
  decode,
  emailFromString,
  lowerCase,
  toSingleEither,
} from "./iots";

describe("toSingleEither", () => {
  const testCases: [
    string,
    Either<string, string>[],
    Either<string[], string[]>
  ][] = [
    ["empty list", [], right([])],
    ["single right", [right("OK")], right(["OK"])],
    ["single left", [left("ERROR")], left(["ERROR"])],
    [
      "many rights",
      [right("OK#0"), right("OK#1"), right("OK#2")],
      right(["OK#0", "OK#1", "OK#2"]),
    ],
    [
      "many lefts",
      [left("ERROR#0"), left("ERROR#1"), left("ERROR#2")],
      left(["ERROR#0", "ERROR#1", "ERROR#2"]),
    ],
    [
      "mixed",
      [right("OK#0"), left("ERROR#0"), right("OK#1"), left("ERROR#1")],
      left(["ERROR#0", "ERROR#1"]),
    ],
  ];

  test.each(testCases)(
    "toSingleEither %p",
    (
      _title: string,
      eithers: Either<string, string>[],
      singleEither: Either<string[], string[]>
    ) => {
      const result = toSingleEither(eithers);
      expect(result).toEqual(singleEither);
    }
  );
});

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

describe("DateFromISOStringV2", () => {
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

describe("DateISOString", () => {
  const testCases: [string, string | Date, boolean][] = [
    ["short date (no time)", "2020-10-20", true],
    ["ISO8061 timestmap", "2020-10-20T00:00:00.000Z", true],
    ["a date object", new Date(), false],
    ["just the time", "00:00:00", false],
    ["string that is not a date", "not a date", false],
  ];

  test.each(testCases)(
    "decode %p as dateISOString?",
    (_title: string, u: string | Date, isDateISOString: boolean) => {
      const decodeResult = decode(dateISOString, u);
      expect(isRight(decodeResult)).toEqual(isDateISOString);
    }
  );
});

describe("EmailFromString", () => {
  const testCases: [string, string, boolean][] = [
    ["empty string", "", false],
    ["normal email", "test@example.com", true],
    ["normal email with plus", "test+ola@gmail.com", true],
    ["invalid email (not @)", "testexamplecom", false],
    ["invalid email (not .)", "test@examplecom", false],
    ["invalid email (spaces)", "test test@example.com", false],
    ["invalid email (multiple)", "test@example.com, test2@example.com", false],
  ];

  test.each(testCases)(
    "decode %p as emailFromString?",
    (_title: string, u: string, isEmail: boolean) => {
      const decodeResult = decode(emailFromString, u);
      expect(isRight(decodeResult)).toEqual(isEmail);
    }
  );
});
