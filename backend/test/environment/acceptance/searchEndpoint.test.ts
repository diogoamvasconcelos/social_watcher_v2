import { decode, fromEither, lowerCase, positiveInteger } from "../../../src/lib/iots";
import { getLogger } from "../../../src/lib/logger";
import { Awaited } from "../../../src/lib/types";
import { uuid } from "../../../src/lib/uuid";
import { getEnvTestConfig } from "../../lib/config";
import { addSearchResultDirectly, createTestUser, deleteKeyword, deleteUser } from "./steps";
import {
  getClient as getApiClient,
} from "../../../src/lib/apiClient/apiClient";

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

  it("can search for an allowed keyword", async () => {
    // add syntetic search result
    const searchResult = await addSearchResultDirectly({keyword})
  })

  afterAll(async () => {
    await deleteUser(testUser);
    await deleteKeyword(keyword);
  });
});

