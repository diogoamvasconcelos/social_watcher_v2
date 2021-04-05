import { SearchObjectUserData } from "../../../src/domain/models/searchObject";
import {
  getClient as getApiClient,
  updateSearchObject,
} from "../../../src/lib/apiClient/apiClient";
import {
  decode,
  fromEither,
  lowerCase,
  positiveInteger,
} from "../../../src/lib/iots";
import { getLogger } from "../../../src/lib/logger";
import { Awaited } from "../../../src/lib/types";
import { uuid } from "../../../src/lib/uuid";
import { getEnvTestConfig } from "../../lib/config";
import {
  createTestUser,
  deleteUser,
  getIdToken,
  updateUserSubscription,
} from "./steps";

const config = getEnvTestConfig();
const logger = getLogger();
const apiClient = getApiClient(config.apiEndpoint);

describe("update searchObject e2e test", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeAll(async () => {
    testUser = await createTestUser();
  });

  it("updateSearchKeyword works", async () => {
    await updateUserSubscription({
      userId: testUser.id,
      updatedData: { nofSearchObjects: fromEither(decode(positiveInteger, 1)) },
    });

    const idToken = await getIdToken({
      username: testUser.email,
      password: testUser.password,
    });

    const index = fromEither(decode(positiveInteger, 0));
    const userData: SearchObjectUserData = {
      keyword: fromEither(decode(lowerCase, uuid())),
      searchData: {
        twitter: { enabledStatus: "ENABLED" },
      },
    };

    const response = fromEither(
      await updateSearchObject(
        {
          client: apiClient,
          token: idToken,
          logger,
        },
        { index, userData }
      )
    );

    expect(response).toEqual(expect.objectContaining({ index, ...userData }));
  });

  afterAll(async () => {
    await deleteUser(testUser);
  });
});
