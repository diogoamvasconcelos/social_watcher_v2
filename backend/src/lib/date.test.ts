import { fromUnix, iso8061DurationToSeconds } from "./date";

describe("date", () => {
  it("fromUnix", () => {
    const date = fromUnix(1621437919);

    expect(new Date(date).toDateString()).toEqual("Wed May 19 2021");
  });

  describe("iso8061DurationToSeconds", () => {
    const testCases: [string, string, number][] = [
      ["14s", "PT14S", 14],
      ["2min and 38s", "PT2M38S", 158],
      ["1hour, 45min and 44s", "PT1H45M44S", 3600 + 45 * 60 + 44],
      ["negative 1hour", "-PT1H", -3600],
      ["not a duration", "something", 0],
    ];

    test.each(testCases)(
      "convert %p to duration",
      (_title: string, s: string, seconds: number) => {
        expect(iso8061DurationToSeconds(s)).toEqual(seconds);
      }
    );
  });
});
