import { isTestEmail } from "./isTestUser";

describe("isTestEmail", () => {
  const testCases: [string, string, boolean][] = [
    ["a gmail", "lal@gmail.com", false],
    ["a amazonses.com", "lal@amazonses.com", false],
    ["a amazonses simulator", "lal@simulator.amazonses.com", true],
  ];

  test.each(testCases)(
    "%p validateKeyword test",
    async (_title: string, email: string, expectsOutput: boolean) => {
      const isTest = isTestEmail(email);
      expect(isTest).toEqual(expectsOutput);
    }
  );
});
