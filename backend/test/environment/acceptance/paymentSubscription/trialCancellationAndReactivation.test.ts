import { Awaited } from "../../../../src/lib/types";
import { getEnvTestConfig } from "../../../lib/config";
import {
  addNewNormalSubscription,
  createTestUser,
  deleteNormalSubsctiption,
  deleteUser,
  getIdToken,
  getPaymentData,
} from "../steps";
import {
  getClient as getApiClient,
  getUser as getUserApi,
} from "../../../../src/lib/apiClient/apiClient";
import { fromEither } from "../../../../src/lib/iots";
import { retryUntil } from "../../../lib/retry";

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("Trial cancellation and re-activation", () => {
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

  it("Trial cancellation is handled", async () => {
    const user = fromEither(
      await getUserApi({
        client: apiClient,
        token: userToken,
      })
    );
    expect(user.subscriptionType).toEqual("TRIAL");

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
          res.subscriptionType == "TRIAL" &&
          res.subscriptionStatus == "CANCELED"
      )
    );
    expect(cancelledUser.subscriptionType).toEqual("TRIAL");
    expect(cancelledUser.subscriptionStatus).toEqual("CANCELED");

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
          res.subscriptionType == "NORMAL" && res.subscriptionStatus == "ACTIVE"
      )
    );
    expect(reactivatedUser.subscriptionType).toEqual("NORMAL");
    expect(reactivatedUser.subscriptionStatus).toEqual("ACTIVE");
    expect(reactivatedUser.nofSearchObjects).toEqual(10);
  });
});
