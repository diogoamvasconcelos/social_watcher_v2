import { fromEither } from "@diogovasconcelos/lib/iots";
import { getClientAPIKey } from "@src/adapters/instagramSearcher/client";
import { getLogger } from "@src/lib/logger";
import { getClient as getSsmClient } from "@src/lib/ssm";

const logger = getLogger();

describe("integration adapters/instagramSearcher/client", () => {
  describe("getClientAPIKey", () => {
    it("can find the API key in SSM", async () => {
      const apiKey = fromEither(await getClientAPIKey(getSsmClient(), logger));

      expect(apiKey).toEqual(expect.any(String));
      expect(apiKey.length > 0).toBeTruthy();
    });
  });
});
