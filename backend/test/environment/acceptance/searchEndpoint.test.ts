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
import _ from "lodash";
import { SearchResult } from "@src/domain/models/searchResult";
import { isNonEmpty } from "fp-ts/lib/Array";

jest.setTimeout(60000);

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("search endpoint e2e (nearly)", () => {
  let testUser: TestUser;
  let userToken: string;
  const nofKeywords = newPositiveInteger(3);
  const keywords = _.range(nofKeywords).map((_) => newLowerCase(uuid()));
  let searchResults: SearchResult[];

  beforeAll(async () => {
    testUser = await createTestUser({
      nofSearchObjects: nofKeywords,
    });

    userToken = await getIdToken({
      username: testUser.email,
      password: testUser.password,
    });

    // add syntetic search results for each keyword
    searchResults = await Promise.all(
      keywords.map(
        async (keyword) =>
          await addSearchResultDirectly({
            keyword,
            socialMedia: "twitter",
          })
      )
    );
  });

  afterAll(async () => {
    await deleteUser(testUser);
    await Promise.all(keywords.map(async (keyword) => deleteKeyword(keyword)));
  });

  it("can search for an allowed keyword", async () => {
    // add keyword to user
    await createUserSearchObject({
      token: userToken,
      keyword: keywords[0],
      twitterStatus: "ENABLED",
    });

    const searchResponse = await trySearchUsingApi(
      { client: apiClient, token: userToken },
      { userData: { keywords: [keywords[0]] } }
    );

    expect(searchResponse.items).toEqual([searchResults[0]]);
  });

  it("can search for multiple keyword", async () => {
    // add more keywords to user
    const otherKeywords = keywords.slice(1, 3);
    await Promise.all(
      otherKeywords.map(
        async (keyword) =>
          await createUserSearchObject({
            token: userToken,
            keyword,
            twitterStatus: "ENABLED",
          })
      )
    );

    const searchResponse = await trySearchUsingApi(
      { client: apiClient, token: userToken },
      {
        userData: {
          keywords: isNonEmpty(otherKeywords) ? otherKeywords : [keywords[0]],
        },
      }
    );

    expect(searchResponse.items).toIncludeSameMembers(
      searchResults.slice(1, 3)
    );
  });

  it("can search with time queries", async () => {
    const queryStartTime = getMinutesAgo(20);
    const queryEndTime = getMinutesAgo(10);
    const keyword = keywords[0];

    // add syntetic search result before range
    await addSearchResultDirectly({
      keyword,
      happenedAt: getMinutesAgo(1, new Date(queryStartTime)),
    });
    // add syntetic search result withing range
    const searchResultWithin = await addSearchResultDirectly({
      keyword,
      happenedAt: getMinutesAgo(1, new Date(queryEndTime)),
    });
    // add syntetic search result after range
    await addSearchResultDirectly({
      keyword,
      happenedAt: getMinutesAgo(-1, new Date(queryEndTime)),
    });

    const searchResponse = await trySearchUsingApi(
      { client: apiClient, token: userToken },
      {
        userData: {
          keywords: [keyword],
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
    const keyword = keywords[0];

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
          keywords: [keyword],
          socialMediaQuery: ["reddit"],
        },
      }
    );

    expect(searchResponse.items).toEqual([searchResultReddit]);
  });

  // IMPORTANT:
  // run this test last as it disables the keyword
  it("can't search for not allowed keywords", async () => {
    const keyword = keywords[0];
    const anotherKeyword = newLowerCase(uuid());

    let responseEither = await search(
      { client: apiClient, token: userToken },
      { userData: { keywords: [anotherKeyword] } }
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
      { userData: { keywords: [keyword] } }
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
