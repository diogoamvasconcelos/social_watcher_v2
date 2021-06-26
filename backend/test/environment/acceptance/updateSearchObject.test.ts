import { DiscordNotificationConfig } from "../../../src/domain/models/notificationJob";
import {
  getClient as getApiClient,
  getSearchObjects,
  updateSearchObject,
} from "../../../src/lib/apiClient/apiClient";
import {
  fromEither,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { Awaited } from "../../../src/lib/types";
import { uuid } from "../../../src/lib/uuid";
import { getEnvTestConfig } from "../../lib/config";
import { createTestUser, deleteKeyword, deleteUser, getIdToken } from "./steps";
import { SearchObjectUserDataIo } from "../../../src/domain/models/userItem";

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
    const userData: SearchObjectUserDataIo = {
      keyword,
      searchData: {
        twitter: { enabledStatus: "ENABLED" },
        reddit: { enabledStatus: "ENABLED", over18: false },
        hackernews: { enabledStatus: "ENABLED" },
      },
      notificationData: {},
    };

    const expectedResponse = expect.objectContaining({
      index,
      ...{ ...userData, notificationData: expect.any(Object) },
    });

    const response = fromEither(
      await updateSearchObject(
        {
          client: apiClient,
          token,
        },
        { index, userData }
      )
    );
    expect(response).toEqual(expectedResponse);

    const getSearchObjectsResponse = fromEither(
      await getSearchObjects({
        client: apiClient,
        token,
      })
    );
    expect(getSearchObjectsResponse).toEqual({
      items: [expectedResponse],
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
      initialGetSearchObjectsResponse.items[0].notificationData
        .discordNotification?.enabledStatus
    ).toEqual("DISABLED");

    const discordNotificationConfig: DiscordNotificationConfig = {
      enabledStatus: "ENABLED",
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
            notificationData: {
              discordNotification: discordNotificationConfig,
            },
          },
        }
      )
    );
    expect(response).toEqual(
      expect.objectContaining({
        index,
        notificationData: { discordNotification: discordNotificationConfig },
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
          notificationData: { discordNotification: discordNotificationConfig },
        }),
      ],
    });
  });
});
