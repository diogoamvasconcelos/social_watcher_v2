import {
  fromEither,
  newLowerCase,
  newPositiveInteger,
} from "../../../src/lib/iots";
import { Awaited } from "../../../src/lib/types";
import { uuid } from "../../../src/lib/uuid";
import { getEnvTestConfig } from "../../lib/config";
import {
  addSearchResultDirectly,
  createTestUser,
  deleteKeyword,
  deleteUser,
  getIdToken,
  updateKeyword,
  updateUserSubscription,
} from "./steps";
import {
  getClient as getApiClient,
  search,
} from "../../../src/lib/apiClient/apiClient";
import { retryUntil, sleep } from "../../lib/retry";
import { isLeft } from "fp-ts/lib/Either";

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("search endpoint e2e (nearly)", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  const keyword = newLowerCase(uuid());

  beforeAll(async () => {
    jest.setTimeout(30000);
    testUser = await createTestUser({
      nofSearchObjects: newPositiveInteger(1),
    });
  });

  it("can search for an allowed keyword", async () => {
    // add syntetic search result
    const searchResult = await addSearchResultDirectly({ keyword });

    // add keyword to user
    const token = await getIdToken({
      username: testUser.email,
      password: testUser.password,
    });
    await updateKeyword({
      token: token,
      keyword,
      index: 0,
      twitterStatus: "ENABLED",
    });

    const searchResponse = await trySearchUsingApi(
      { client: apiClient, token },
      { userData: { keyword } }
    );

    expect(searchResponse.items).toEqual([searchResult]);
  });

  it("can't search for not allowed keywords", async () => {
    const anotherKeyword = newLowerCase(uuid());
    const token = await getIdToken({
      username: testUser.email,
      password: testUser.password,
    });

    let responseEither = await search(
      { client: apiClient, token },
      { userData: { keyword: anotherKeyword } }
    );

    expect(
      isLeft(responseEither) && typeof responseEither.left != "string"
    ).toBeTruthy();
    if (isLeft(responseEither) && typeof responseEither.left != "string") {
      expect(responseEither.left.status).toEqual(403);
    }

    // Change user subscription to disable the keyword
    await updateUserSubscription({
      userId: testUser.id,
      updatedData: { nofSearchObjects: newPositiveInteger(0) },
    });

    await sleep(5000); // wait to propagate

    responseEither = await search(
      { client: apiClient, token },
      { userData: { keyword } }
    );

    expect(
      isLeft(responseEither) && typeof responseEither.left != "string"
    ).toBeTruthy();
    if (isLeft(responseEither) && typeof responseEither.left != "string") {
      expect(responseEither.left.status).toEqual(403);
    }
  });

  afterAll(async () => {
    await deleteUser(testUser);
    await deleteKeyword(keyword);
  });
});

const trySearchUsingApi = async (...searchArgs: Parameters<typeof search>) => {
  return fromEither(
    await retryUntil(
      async () => fromEither(await search(...searchArgs)),
      (res) => res.items.length > 0
    )
  );
};
