import { getEnvTestConfig } from "@test/lib/config";
import {
  addSearchResultDirectly,
  createTestUser,
  createUserSearchObject,
  deleteUser,
  getIdToken,
  TestUser,
} from "./steps";
import {
  addTagToResult,
  getClient as getApiClient,
  getResultTags,
} from "@src/lib/apiClient/apiClient";
import { fromEither, newLowerCase } from "@diogovasconcelos/lib/iots";
import { uuid } from "@src/lib/uuid";

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

jest.setTimeout(20000);

describe("addTagToResult e2e test", () => {
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
    // add syntetic search result
    const searchResult = await addSearchResultDirectly({
      keyword,
      socialMedia: "twitter",
    });
    expect(searchResult.tags).toBeUndefined();

    // add keyword to user
    await createUserSearchObject({
      token: userToken,
      keyword,
      twitterStatus: "ENABLED",
    });

    // get favourite tag from user
    const getResultTagsResponse = fromEither(
      await getResultTags({
        client: apiClient,
        token: userToken,
      })
    );
    expect(getResultTagsResponse.items[0].tagType).toEqual("FAVORITE");
    const favoriteTag = getResultTagsResponse.items[0];

    const updatedResult = fromEither(
      await addTagToResult(
        { client: apiClient, token: userToken },
        {
          searchResultId: searchResult.id,
          userData: {
            tagId: favoriteTag.tagId,
          },
        }
      )
    );
    expect(updatedResult.tags).toEqual([favoriteTag.tagId]);
  });
});
