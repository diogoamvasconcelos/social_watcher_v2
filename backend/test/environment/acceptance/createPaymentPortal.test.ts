import { Awaited } from "../../../src/lib/types";
import { createTestUser, deleteUser, getIdToken } from "./steps";
import {
  getClient as getApiClient,
  createPaymentsPortal,
} from "../../../src/lib/apiClient/apiClient";
import { getEnvTestConfig } from "../../lib/config";
import { fromEither } from "@shared/lib/src/iots";
import logger from "../../../src/lib/logger";

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("e2e/createPaymentPortal", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let userToken: string;

  beforeAll(async () => {
    jest.setTimeout(30000);
    testUser = await createTestUser();

    userToken = await getIdToken({
      username: testUser.email,
      password: testUser.password,
    });
  });

  afterAll(async () => {
    await deleteUser(testUser);
  });

  it("Can successfully return a session url", async () => {
    const res = fromEither(
      await createPaymentsPortal(
        { client: apiClient, token: userToken },
        { userData: { returnUrl: "http://localhost.com/1234/account" } }
      )
    );

    logger.info("createPaymentsPortal response", { res });
    expect(res.sessionUrl).toEqual(expect.any(String));
  });
});
