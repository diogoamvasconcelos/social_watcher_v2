import { Awaited } from "../../../src/lib/types";
import { getEnvTestConfig } from "../../lib/config";
import {
  createTestUser,
  deleteUser,
  getIdToken,
  getPaymentData,
  updateUserPaymentsSubscription,
} from "./steps";
import {
  getClient as getApiClient,
  getUser as getUserApi,
} from "../../../src/lib/apiClient/apiClient";
import { fromEither } from "../../../src/lib/iots";
import { retryUntil } from "../../lib/retry";

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("Trial subscription", () => {
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

  it("Trial expiration is handled", async () => {
    const user = fromEither(
      await getUserApi({
        client: apiClient,
        token: userToken,
      })
    );
    expect(user.subscriptionType).toEqual("TRIAL");

    // update trial to force expiration
    const paymentData = fromEither(await getPaymentData(user.id));
    if (paymentData == "NOT_FOUND") {
      throw new Error("Failed to get user PaymentsData");
    }
    await updateUserPaymentsSubscription(paymentData, { trial_end: "now" });

    const expiredTrialUser = fromEither(
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
          res.subscriptionStatus == "PAST_DUE"
      )
    );
    expect(expiredTrialUser.subscriptionType).toEqual("TRIAL");
    expect(expiredTrialUser.subscriptionStatus).toEqual("PAST_DUE");
  });
});
