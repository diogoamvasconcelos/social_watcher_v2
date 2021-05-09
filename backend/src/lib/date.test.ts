import { fromUnix } from "./date";

describe("date", () => {
  it("fromUnix", () => {
    const date = fromUnix(1621437919);

    expect(new Date(date).toDateString()).toEqual("Wed May 19 2021");
  });
});
