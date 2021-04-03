import _ from "lodash";
import {
  getClient as getApiClient,
  getUser as getUserApi,
} from "../../../src/lib/apiClient/apiClient";
import { fromEither } from "../../../src/lib/iots";
import { getLogger } from "../../../src/lib/logger";
import { Awaited } from "../../../src/lib/types";
import { getEnvTestConfig } from "../../lib/config";
import { createTestUser, deleteUser, getIdToken, getUser } from "./steps";

const config = getEnvTestConfig();
const logger = getLogger();
const apiClient = getApiClient(config.apiEndpoint);

describe("signup e2e test", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeAll(async () => {
    testUser = await createTestUser();
  });

  it("created user in users table", async () => {
    const userData = fromEither(await getUser(testUser.id));
    expect(userData).toEqual(
      expect.objectContaining(_.omit(testUser, ["password"]))
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
        logger,
      })
    );

    expect(user).toEqual(
      expect.objectContaining(_.omit(testUser, ["password"]))
    );
  });

  afterAll(async () => {
    await deleteUser(testUser);
  });
});
