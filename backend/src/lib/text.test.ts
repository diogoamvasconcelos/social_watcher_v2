import { capitalizeWord } from "./text";

describe("lib/text", () => {
  describe("capitalizeWord", () => {
    const testCases: [string, string, string][] = [
      ["CAPS", "CAPS", "Caps"],
      ["lower", "lower", "Lower"],
      ["MiXeD", "MiXeD", "Mixed"],
    ];

    test.each(testCases)(
      "capitalizes %p",
      (_title: string, s: string, expected: string) => {
        expect(capitalizeWord(s)).toEqual(expected);
      }
    );
  });
});
