import {
  getClient as getApiClient,
  getDefaultSearchObject,
} from "@src/lib/apiClient/apiClient";
import {
  fromEither,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { Awaited } from "@src/lib/types";
import { uuid } from "@src/lib/uuid";
import { getEnvTestConfig } from "@test/lib/config";
import { createTestUser, deleteKeyword, deleteUser, getIdToken } from "./steps";

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("get default searchObject endpoint test", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let userToken: string;
  const keyword = newLowerCase(uuid());

  beforeAll(async () => {
    jest.setTimeout(10000);
    testUser = await createTestUser({
      nofSearchObjects: newPositiveInteger(1),
    });

    userToken = await getIdToken({
      username: testUser.email,
      password: testUser.password,
    });
  });

  afterAll(async () => {
    await deleteUser(testUser);
    await deleteKeyword(keyword);
  });

  it("getDefaultSearchObject works", async () => {
    const response = fromEither(
      await getDefaultSearchObject({
        client: apiClient,
        token: userToken,
      })
    );

    expect(response).toEqual(
      expect.objectContaining({
        type: "SEARCH_OBJECT",
        id: testUser.id,
      })
    );
  });
});
