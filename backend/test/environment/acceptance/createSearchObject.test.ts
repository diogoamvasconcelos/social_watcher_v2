import {
  createSearchObject,
  getClient as getApiClient,
  getSearchObjects,
} from "@src/lib/apiClient/apiClient";
import {
  fromEither,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { uuid } from "@src/lib/uuid";
import { getEnvTestConfig } from "@test/lib/config";
import {
  createTestUser,
  deleteKeyword,
  deleteUser,
  getIdToken,
  TestUser,
} from "./steps";
import { SearchObjectUserDataIo } from "@src/domain/models/userItem";

jest.setTimeout(20000);

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("create searchObject e2e test", () => {
  let testUser: TestUser;
  let userToken: string;
  const keyword = newLowerCase(uuid());

  beforeAll(async () => {
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

  it("createSearchObject works", async () => {
    const userData: SearchObjectUserDataIo = {
      keyword,
      searchData: {
        twitter: { enabledStatus: "ENABLED" },
      },
      notificationData: {},
    };

    const expectedResponse = expect.objectContaining({
      index: newPositiveInteger(0),
      ...userData,
      searchData: expect.objectContaining(userData.searchData),
      notificationData: expect.objectContaining(userData.notificationData),
      reportData: expect.any(Object),
    });

    const response = fromEither(
      await createSearchObject(
        {
          client: apiClient,
          token: userToken,
        },
        { userData }
      )
    );
    expect(response).toEqual(expectedResponse);

    const getSearchObjectsResponse = fromEither(
      await getSearchObjects({
        client: apiClient,
        token: userToken,
      })
    );
    expect(getSearchObjectsResponse).toEqual({
      items: [expectedResponse],
    });
  });
});
