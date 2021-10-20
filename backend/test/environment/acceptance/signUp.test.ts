import _ from "lodash";
import {
  getClient as getApiClient,
  getUser as getUserApi,
} from "@src/lib/apiClient/apiClient";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { getEnvTestConfig } from "@test/lib/config";
import {
  createTestUser,
  deleteUser,
  getIdToken,
  getPaymentData,
  getResultTags,
  getUser,
  TestUser,
} from "./steps";

jest.setTimeout(10000);

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("signup e2e test", () => {
  let testUser: TestUser;

  beforeAll(async () => {
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

    const resultTags = fromEither(await getResultTags(testUser.id));
    expect(resultTags).toEqual([
      expect.objectContaining({
        tagType: "FAVORITE",
      }),
    ]);
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
