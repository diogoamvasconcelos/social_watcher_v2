import { createTestUser, deleteUser, getIdToken, TestUser } from "./steps";
import {
  getClient as getApiClient,
  createPaymentsPortal,
} from "@src/lib/apiClient/apiClient";
import { getEnvTestConfig } from "@test/lib/config";
import { fromEither } from "@diogovasconcelos/lib/iots";
import logger from "@src/lib/logger";

jest.setTimeout(30000);

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("e2e/createPaymentPortal", () => {
  let testUser: TestUser;
  let userToken: string;

  beforeAll(async () => {
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
        { userData: { returnUrl: "http://localhost.com/8080/account" } }
      )
    );

    logger.info("createPaymentsPortal response", { res });
    expect(res.sessionUrl).toEqual(expect.any(String));
  });
});
