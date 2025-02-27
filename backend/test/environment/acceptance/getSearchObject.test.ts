import {
  createSearchObject,
  getClient as getApiClient,
  getSearchObject,
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
import { isLeft } from "fp-ts/lib/Either";

jest.setTimeout(20000);

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("get searchObject e2e test", () => {
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

  it("getSearchObject returns 404", async () => {
    const index = newPositiveInteger(0);
    const responseEither = await getSearchObject(
      {
        client: apiClient,
        token: userToken,
      },
      { index }
    );

    expect(
      isLeft(responseEither) && typeof responseEither.left != "string"
    ).toBeTruthy();
    if (isLeft(responseEither) && typeof responseEither.left != "string") {
      expect(responseEither.left.status).toEqual(404);
    }
  });

  it("getSearchObject returns 200 on existing", async () => {
    // similar to a updateSearchObject endpoint test
    const index = newPositiveInteger(0);
    const userData: SearchObjectUserDataIo = {
      keyword,
    };

    const expectedResponse = expect.objectContaining({
      index,
      ...{
        ...userData,
        searchData: expect.any(Object),
        notificationData: expect.any(Object),
        reportData: expect.any(Object),
      },
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

    const getSearchObjectResponse = fromEither(
      await getSearchObject(
        {
          client: apiClient,
          token: userToken,
        },
        { index }
      )
    );
    expect(getSearchObjectResponse).toEqual(expectedResponse);
  });
});
