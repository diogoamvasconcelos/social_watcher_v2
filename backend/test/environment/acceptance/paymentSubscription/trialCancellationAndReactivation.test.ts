import { Awaited } from "@src/lib/types";
import { getEnvTestConfig } from "@test/lib/config";
import {
  addNewNormalSubscription,
  createTestUser,
  deleteNormalSubsctiption,
  deleteUser,
  getIdToken,
  getPaymentData,
} from "@test/environment/acceptance/steps";
import {
  getClient as getApiClient,
  getUser as getUserApi,
} from "@src/lib/apiClient/apiClient";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { retryUntil } from "@test/lib/retry";
import { addDays } from "@src/lib/date";
import { getSubscriptionConfig } from "@src/domain/models/subscriptionConfig";

const config = getEnvTestConfig();
const subscriptionConfig = getSubscriptionConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("Trial cancellation and re-activation", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let userToken: string;

  beforeAll(async () => {
    jest.setTimeout(45000);
    testUser = await createTestUser();

    userToken = await getIdToken({
      username: testUser.email,
      password: testUser.password,
    });
  });

  afterAll(async () => {
    await deleteUser(testUser);
  });

  it("Trial cancellation is handled", async () => {
    const user = fromEither(
      await getUserApi({
        client: apiClient,
        token: userToken,
      })
    );
    expect(user.subscription.type).toEqual("TRIAL");

    // delete subscription
    const paymentData = fromEither(await getPaymentData(user.id));
    if (paymentData == "NOT_FOUND") {
      throw new Error("Failed to get user PaymentsData");
    }

    await deleteNormalSubsctiption(paymentData);

    const cancelledUser = fromEither(
      await retryUntil(
        async () =>
          fromEither(
            await getUserApi({
              client: apiClient,
              token: userToken,
            })
          ),
        (res) =>
          res.subscription.type == "TRIAL" &&
          res.subscription.status == "CANCELED"
      )
    );
    expect(cancelledUser.subscription.type).toEqual("TRIAL");
    expect(cancelledUser.subscription.status).toEqual("CANCELED");
    expect(
      new Date(cancelledUser.subscription.expiresAt ?? 0).toDateString()
    ).toEqual(
      addDays(
        new Date(Date.now()),
        subscriptionConfig.trial.durationInDays
      ).toDateString()
    );

    // add new subscription (re-activation)
    await addNewNormalSubscription(paymentData, "pm_card_visa");

    const reactivatedUser = fromEither(
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
    expect(reactivatedUser.subscription.type).toEqual("NORMAL");
    expect(reactivatedUser.subscription.status).toEqual("ACTIVE");
    expect(reactivatedUser.subscription.nofSearchObjects).toEqual(10);
    expect(reactivatedUser.subscription.expiresAt).toBeUndefined();
  });
});
