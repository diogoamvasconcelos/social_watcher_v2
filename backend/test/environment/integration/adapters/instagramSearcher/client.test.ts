import { fromEither } from "@diogovasconcelos/lib/iots";
import { ensureAPIKeyInEnv } from "../../../../../src/adapters/instagramSearcher/client";
import { getLogger } from "../../../../../src/lib/logger";
import { getClient as getSsmClient } from "../../../../../src/lib/ssm";

const logger = getLogger();

describe("integration adapters/instagramSearcher/client", () => {
  describe("ensureAPIKeyInEnv", () => {
    it("can find the API key in SSM", async () => {
      const apiKey = fromEither(
        await ensureAPIKeyInEnv(getSsmClient(), logger)
      );

      expect(apiKey).toEqual(expect.any(String));
      expect(apiKey.length > 0).toBeTruthy();
      expect(process.env["RAPIDAPI_KEY"]).toEqual(apiKey);
    });
  });
});
