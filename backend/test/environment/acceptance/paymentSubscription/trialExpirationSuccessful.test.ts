import { getEnvTestConfig } from "@test/lib/config";
import {
  createTestUser,
  deleteUser,
  getIdToken,
  getPaymentData,
  TestUser,
  updateUserPaymentsSubscription,
} from "@test/environment/acceptance/steps";
import {
  getClient as getApiClient,
  getUser as getUserApi,
} from "@src/lib/apiClient/apiClient";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { retryUntil } from "@test/lib/retry";
import { getSubscriptionConfig } from "@src/domain/models/subscriptionConfig";
import { addDays } from "@src/lib/date";

jest.setTimeout(45000);

const config = getEnvTestConfig();
const subscriptionConfig = getSubscriptionConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("Trial expiration successful", () => {
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

  it("is handled when payment is successful", async () => {
    const user = fromEither(
      await getUserApi({
        client: apiClient,
        token: userToken,
      })
    );

    // check trial data is correct
    expect(user.subscription.type).toEqual("TRIAL");
    expect(user.subscription.status).toEqual("ACTIVE");
    expect(user.subscription.nofSearchObjects).toEqual(
      subscriptionConfig.trial.nofSearchObjects
    );
    expect(new Date(user.subscription.expiresAt ?? 0).toDateString()).toEqual(
      addDays(
        new Date(Date.now()),
        subscriptionConfig.trial.durationInDays
      ).toDateString()
    );

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
