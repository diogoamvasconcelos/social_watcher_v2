import { DiscordNotificationConfig } from "../../../src/domain/models/notificationJob";
import { SearchObjectUserData } from "../../../src/domain/models/userItem";
import {
  getClient as getApiClient,
  getSearchObjects,
  updateSearchObject,
} from "../../../src/lib/apiClient/apiClient";
import {
  fromEither,
  newLowerCase,
  newPositiveInteger,
} from "@shared/lib/src//lib/iots";
import { Awaited } from "../../../src/lib/types";
import { uuid } from "../../../src/lib/uuid";
import { getEnvTestConfig } from "../../lib/config";
import { createTestUser, deleteKeyword, deleteUser, getIdToken } from "./steps";

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("update searchObject e2e test", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  const keyword = newLowerCase(uuid());

  beforeAll(async () => {
    jest.setTimeout(10000);
    testUser = await createTestUser({
      nofSearchObjects: newPositiveInteger(1),
    });
  });

  afterAll(async () => {
    await deleteUser(testUser);
    await deleteKeyword(keyword);
  });

  it("updateSearchKeyword works", async () => {
    const token = await getIdToken({
      username: testUser.email,
      password: testUser.password,
    });

    const index = newPositiveInteger(0);
    const userData: SearchObjectUserData = {
      keyword,
      searchData: {
        twitter: { enabledStatus: "ENABLED" },
      },
    };

    const response = fromEither(
      await updateSearchObject(
        {
          client: apiClient,
          token,
        },
        { index, userData }
      )
    );
    expect(response).toEqual(expect.objectContaining({ index, ...userData }));

    const getSearchObjectsResponse = fromEither(
      await getSearchObjects({
        client: apiClient,
        token,
      })
    );
    expect(getSearchObjectsResponse).toEqual({
      items: [expect.objectContaining({ index, ...userData })],
    });
  });

  it("can update discord notification config", async () => {
    const token = await getIdToken({
      username: testUser.email,
      password: testUser.password,
    });

    const index = newPositiveInteger(0);

    const initialGetSearchObjectsResponse = fromEither(
      await getSearchObjects({
        client: apiClient,
        token,
      })
    );
    expect(
      initialGetSearchObjectsResponse.items[0].discordNotification
    ).toBeUndefined();

    const discordNotificationConfig: DiscordNotificationConfig = {
      enabled: true,
      channel: "a-channel",
      bot: { credentials: { token: "a-token" } },
    };

    const response = fromEither(
      await updateSearchObject(
        {
          client: apiClient,
          token,
        },
        {
          index,
          userData: {
            ...initialGetSearchObjectsResponse.items[0],
            discordNotification: discordNotificationConfig,
          },
        }
      )
    );
    expect(response).toEqual(
      expect.objectContaining({
        index,
        discordNotification: discordNotificationConfig,
      })
    );

    const getSearchObjectsResponse = fromEither(
      await getSearchObjects({
        client: apiClient,
        token,
      })
    );
    expect(getSearchObjectsResponse).toEqual({
      items: [
        expect.objectContaining({
          index,
          discordNotification: discordNotificationConfig,
        }),
      ],
    });
  });
});
