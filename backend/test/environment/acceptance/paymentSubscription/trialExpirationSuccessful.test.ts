import { Awaited } from "../../../../src/lib/types";
import { getEnvTestConfig } from "../../../lib/config";
import {
  createTestUser,
  deleteUser,
  getIdToken,
  getPaymentData,
  updateUserPaymentsSubscription,
} from "../steps";
import {
  getClient as getApiClient,
  getUser as getUserApi,
} from "../../../../src/lib/apiClient/apiClient";
import { fromEither } from "../../../../src/lib/iots";
import { retryUntil } from "../../../lib/retry";

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("Trial expiration successful", () => {
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

  it("is handled when payment is successful", async () => {
    const user = fromEither(
      await getUserApi({
        client: apiClient,
        token: userToken,
      })
    );
    expect(user.subscription.type).toEqual("TRIAL");
    expect(user.subscription.expiresAt).not.toBeUndefined();

    // update trial to force expiration
    const paymentData = fromEither(await getPaymentData(user.id));
    if (paymentData == "NOT_FOUND") {
      throw new Error("Failed to get user PaymentsData");
    }
    await updateUserPaymentsSubscription(paymentData, "pm_card_visa", {
      trial_end: "now",
    });

    const updatedUser = fromEither(
      await retryUntil(
        async () =>
          fromEither(
            await getUserApi({
              client: apiClient,
              token: userToken,
            })
          ),
        (res) =>
          res.subscription.type == "NORMAL" &&
          res.subscription.status == "ACTIVE"
      )
    );
    expect(updatedUser.subscription.type).toEqual("NORMAL");
    expect(updatedUser.subscription.status).toEqual("ACTIVE");
    expect(updatedUser.subscription.expiresAt).toBeUndefined();
  });
});
