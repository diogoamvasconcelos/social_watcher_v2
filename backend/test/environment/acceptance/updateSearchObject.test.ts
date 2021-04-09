import { SearchObjectUserData } from "../../../src/domain/models/userItem";
import {
  getClient as getApiClient,
  updateSearchObject,
} from "../../../src/lib/apiClient/apiClient";
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
import { createTestUser, deleteKeyword, deleteUser, getIdToken } from "./steps";

const config = getEnvTestConfig();
const logger = getLogger();
const apiClient = getApiClient(config.apiEndpoint);

const keyword = uuid();

describe("update searchObject e2e test", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeAll(async () => {
    jest.setTimeout(10000);
    testUser = await createTestUser({
      nofSearchObjects: fromEither(decode(positiveInteger, 1)),
    });
  });

  it("updateSearchKeyword works", async () => {
    const token = await getIdToken({
      username: testUser.email,
      password: testUser.password,
    });

    const index = fromEither(decode(positiveInteger, 0));
    const userData: SearchObjectUserData = {
      keyword: fromEither(decode(lowerCase, keyword)),
      searchData: {
        twitter: { enabledStatus: "ENABLED" },
      },
    };

    const response = fromEither(
      await updateSearchObject(
        {
          client: apiClient,
          token,
          logger,
        },
        { index, userData }
      )
    );

    expect(response).toEqual(expect.objectContaining({ index, ...userData }));
  });

  afterAll(async () => {
    await deleteUser(testUser);
    await deleteKeyword(keyword);
  });
});
