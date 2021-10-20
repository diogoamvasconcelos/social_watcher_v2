import { uuid } from "@src/lib/uuid";
import {
  fromEither,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { getEnvTestConfig } from "@test/lib/config";
import {
  createTestUser,
  createUserSearchObject,
  deleteKeyword,
  deleteUser,
  getIdToken,
  TestUser,
} from "./steps";
import {
  getClient as getApiClient,
  deleteSearchObject,
  getSearchObject,
} from "@src/lib/apiClient/apiClient";
import { isLeft } from "fp-ts/lib/Either";

jest.setTimeout(20000);

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("deleteSearchObject endpoint e2e test", () => {
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

  it("deleteSearchObject works", async () => {
    const searchObject = await createUserSearchObject({
      token: userToken,
      keyword,
      twitterStatus: "DISABLED",
    });

    const response = fromEither(
      await deleteSearchObject(
        {
          client: apiClient,
          token: userToken,
        },
        { index: searchObject.index }
      )
    );
    expect(response).toEqual(searchObject);

    const getSearchObjectEither = await getSearchObject(
      {
        client: apiClient,
        token: userToken,
      },
      { index: searchObject.index }
    );

    expect(
      isLeft(getSearchObjectEither) &&
        typeof getSearchObjectEither.left != "string"
    ).toBeTruthy();
    if (
      isLeft(getSearchObjectEither) &&
      typeof getSearchObjectEither.left != "string"
    ) {
      expect(getSearchObjectEither.left.status).toEqual(404);
    }
  });
});
