import { getEnvTestConfig } from "@test/lib/config";
import {
  addSearchResultDirectly,
  createTestUser,
  deleteUser,
  getIdToken,
  TestUser,
} from "./steps";
import {
  removeTagFromResult,
  getClient as getApiClient,
  getResultTags,
} from "@src/lib/apiClient/apiClient";
import { fromEither, newLowerCase } from "@diogovasconcelos/lib/iots";
import { uuid } from "@src/lib/uuid";

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

jest.setTimeout(30000);

describe("removeTagFromResult e2e test", () => {
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
  });

  it("successfully handles the happy flow", async () => {
    // get favourite tag from user
    const getResultTagsResponse = fromEither(
      await getResultTags({
        client: apiClient,
        token: userToken,
      })
    );
    expect(getResultTagsResponse.items[0].tagType).toEqual("FAVORITE");
    const favoriteTag = getResultTagsResponse.items[0];

    // add syntetic search result
    const searchResult = await addSearchResultDirectly({
      keyword,
      socialMedia: "twitter",
      tags: [favoriteTag.tagId],
    });
    expect(searchResult.tags).toEqual([favoriteTag.tagId]);

    const updatedResult = fromEither(
      await removeTagFromResult(
        { client: apiClient, token: userToken },
        {
          searchResultId: searchResult.id,
          userData: {
            tagId: favoriteTag.tagId,
          },
        }
      )
    );
    expect(updatedResult.tags).toBeEmpty();
  });
});
