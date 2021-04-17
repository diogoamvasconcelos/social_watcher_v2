import {
  decode,
  fromEither,
  lowerCase,
  positiveInteger,
} from "../../../src/lib/iots";
import { getLogger } from "../../../src/lib/logger";
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
} from "./steps";
import {
  getClient as getApiClient,
  search,
} from "../../../src/lib/apiClient/apiClient";
import { retryUntil } from "../../lib/retry";

const config = getEnvTestConfig();
const logger = getLogger();
const apiClient = getApiClient(config.apiEndpoint);

describe("search endpoint e2e (nearly)", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  const keyword = fromEither(decode(lowerCase, uuid()));

  beforeAll(async () => {
    jest.setTimeout(30000);
    testUser = await createTestUser({
      nofSearchObjects: fromEither(decode(positiveInteger, 1)),
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
      { client: apiClient, logger, token },
      { userData: { keyword } }
    );

    expect(searchResponse.items).toEqual([searchResult]);
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
