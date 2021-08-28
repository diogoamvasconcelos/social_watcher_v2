import _ from "lodash";
import {
  getClient as getApiClient,
  getUser as getUserApi,
} from "@src/lib/apiClient/apiClient";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { Awaited } from "@src/lib/types";
import { getEnvTestConfig } from "@test/lib/config";
import {
  createTestUser,
  deleteUser,
  getIdToken,
  getPaymentData,
  getUser,
} from "./steps";

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("signup e2e test", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeAll(async () => {
    jest.setTimeout(10000);
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await deleteUser(testUser);
  });

  it("created user data is stored", async () => {
    const userData = fromEither(await getUser(testUser.id));
    expect(userData).toEqual(
      expect.objectContaining(_.omit(testUser, ["password"]))
    );

    const paymentData = fromEither(await getPaymentData(testUser.id));
    expect(paymentData).toEqual(
      expect.objectContaining({
        stripe: {
          customerId: expect.any(String),
          subscriptionId: expect.any(String),
        },
      })
    );
  });

  it("token can be used to access API", async () => {
    const idToken = await getIdToken({
      username: testUser.email,
      password: testUser.password,
    });

    const user = fromEither(
      await getUserApi({
        client: apiClient,
        token: idToken,
      })
    );

    expect(user).toEqual(
      expect.objectContaining(_.omit(testUser, ["password"]))
    );
  });
});
