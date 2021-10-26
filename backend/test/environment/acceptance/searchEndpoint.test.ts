import {
  fromEither,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { uuid } from "@src/lib/uuid";
import { getEnvTestConfig } from "@test/lib/config";
import {
  addSearchResultDirectly,
  createTestUser,
  createUserSearchObject,
  deleteKeyword,
  deleteUser,
  getIdToken,
  TestUser,
  updateUserSubscription,
} from "./steps";
import {
  getClient as getApiClient,
  search,
} from "@src/lib/apiClient/apiClient";
import { retryUntil, sleep } from "@test/lib/retry";
import { isLeft } from "fp-ts/lib/Either";
import { getMinutesAgo } from "@src/lib/date";

jest.setTimeout(60000);

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("search endpoint e2e (nearly)", () => {
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

  it("can search for an allowed keyword", async () => {
    // add syntetic search result
    const searchResult = await addSearchResultDirectly({
      keyword,
      socialMedia: "twitter",
    });

    // add keyword to user
    await createUserSearchObject({
      token: userToken,
      keyword,
      twitterStatus: "ENABLED",
    });

    const searchResponse = await trySearchUsingApi(
      { client: apiClient, token: userToken },
      { userData: { keyword } }
    );

    expect(searchResponse.items).toEqual([searchResult]);
  });

  it("can search with time queries", async () => {
    const queryStartTime = getMinutesAgo(20);
    const queryEndTime = getMinutesAgo(10);

    // add syntetic search result before range
    await addSearchResultDirectly({
      keyword,
      socialMedia: "twitter",
      happenedAt: getMinutesAgo(1, new Date(queryStartTime)),
    });
    // add syntetic search result withing range
    const searchResultWithin = await addSearchResultDirectly({
      keyword,
      socialMedia: "twitter",
      happenedAt: getMinutesAgo(1, new Date(queryEndTime)),
    });
    // add syntetic search result after range
    await addSearchResultDirectly({
      keyword,
      socialMedia: "twitter",
      happenedAt: getMinutesAgo(-1, new Date(queryEndTime)),
    });

    const searchResponse = await trySearchUsingApi(
      { client: apiClient, token: userToken },
      {
        userData: {
          keyword,
          timeQuery: {
            happenedAtStart: queryStartTime,
            happenedAtEnd: queryEndTime,
          },
        },
      }
    );

    expect(searchResponse.items).toEqual([searchResultWithin]);
  });

  it("can search with social media", async () => {
    // add syntetic twitter search result
    await addSearchResultDirectly({
      keyword,
      socialMedia: "twitter",
    });
    // add syntetic reddit result withing range
    const searchResultReddit = await addSearchResultDirectly({
      keyword,
      socialMedia: "reddit",
    });

    const searchResponse = await trySearchUsingApi(
      { client: apiClient, token: userToken },
      {
        userData: {
          keyword,
          socialMediaQuery: ["reddit"],
        },
      }
    );

    expect(searchResponse.items).toEqual([searchResultReddit]);
  });

  // IMPORTANT:
  // run this test last as it disables the keyword
  it("can't search for not allowed keywords", async () => {
    const anotherKeyword = newLowerCase(uuid());

    let responseEither = await search(
      { client: apiClient, token: userToken },
      { userData: { keyword: anotherKeyword } }
    );

    expect(
      isLeft(responseEither) && typeof responseEither.left != "string"
    ).toBeTruthy();
    if (isLeft(responseEither) && typeof responseEither.left != "string") {
      expect(responseEither.left.status).toEqual(403);
    }

    //  Change user subscription to disable the keyword
    await updateUserSubscription({
      userId: testUser.id,
      updatedData: { nofSearchObjects: newPositiveInteger(0) },
    });

    await sleep(20000); // wait to propagate (otherwise can be flaky)

    responseEither = await search(
      { client: apiClient, token: userToken },
      { userData: { keyword } }
    );

    expect(
      isLeft(responseEither) && typeof responseEither.left != "string"
    ).toBeTruthy();
    if (isLeft(responseEither) && typeof responseEither.left != "string") {
      expect(responseEither.left.status).toEqual(403);
    }
  });
});

const trySearchUsingApi = async (...searchArgs: Parameters<typeof search>) => {
  return fromEither(
    await retryUntil(
      async () => fromEither(await search(...searchArgs)),
      (res) => res.items.length > 0,
      6
    )
  );
};
