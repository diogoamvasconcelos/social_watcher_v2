import {
  getClient as getApiClient,
  getResultTags,
} from "@src/lib/apiClient/apiClient";
import { fromEither, newLowerCase } from "@diogovasconcelos/lib/iots";
import { uuid } from "@src/lib/uuid";
import { getEnvTestConfig } from "@test/lib/config";
import {
  createTestUser,
  deleteKeyword,
  deleteUser,
  getIdToken,
  TestUser,
} from "./steps";
import { GetResultTagsResponse } from "@src/handlers/api/models/getResultTags";

jest.setTimeout(10000);

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("get result tags e2e test", () => {
  let testUser: TestUser;
  let userToken: string;
  const keyword = newLowerCase(uuid());

  beforeAll(async () => {
    testUser = await createTestUser();

    userToken = await getIdToken({
      username: testUser.email,
      password: testUser.password,
    });
  });

  afterAll(async () => {
    await deleteUser(testUser);
    await deleteKeyword(keyword);
  });

  it("returns 200 and the favorite tag", async () => {
    const getResultTagsResponse = fromEither(
      await getResultTags({
        client: apiClient,
        token: userToken,
      })
    );

    const expectedResponse: GetResultTagsResponse = {
      items: [
        {
          type: "RESULT_TAG",
          id: testUser.id,
          tagId: expect.any(String),
          tagType: "FAVORITE",
          createdAt: expect.any(String),
        },
      ],
    };
    expect(getResultTagsResponse).toEqual(expectedResponse);
  });
});
