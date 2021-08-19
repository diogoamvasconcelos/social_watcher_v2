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
  PositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { Awaited } from "../../../src/lib/types";
import { uuid } from "../../../src/lib/uuid";
import { getEnvTestConfig } from "../../lib/config";
import {
  createTestUser,
  createUserSearchObject,
  deleteKeyword,
  deleteUser,
  getIdToken,
} from "./steps";
import { SearchObjectUserDataIo } from "../../../src/domain/models/userItem";

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

describe("update searchObject e2e test", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let searchObjectIndex: PositiveInteger;
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

  it("updateSearchObject works", async () => {
    const token = await getIdToken({
      username: testUser.email,
      password: testUser.password,
    });

    const initialState = await createUserSearchObject({
      token,
      keyword,
      twitterStatus: "DISABLED",
    });
    searchObjectIndex = initialState.index;
    expect(initialState.searchData.twitter.enabledStatus).toEqual("DISABLED");

    const userData: SearchObjectUserDataIo = {
      keyword,
      searchData: {
        twitter: {
          enabledStatus: "ENABLED",
        },
      },
    };

    const expectedResponse = expect.objectContaining({
      index: searchObjectIndex,
      ...userData,
      searchData: expect.objectContaining(userData.searchData),
      reportData: expect.any(Object),
    });

    const response = fromEither(
      await updateSearchObject(
        {
          client: apiClient,
          token,
        },
        { index: searchObjectIndex, userData }
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

    const initialGetSearchObjectsResponse = fromEither(
      await getSearchObjects({
        client: apiClient,
        token,
      })
    );
    expect(
      initialGetSearchObjectsResponse.items[searchObjectIndex].notificationData
        .discord.enabledStatus
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
          index: searchObjectIndex,
          userData: {
            ...initialGetSearchObjectsResponse.items[0],
            notificationData: {
              discord: discordNotificationConfig,
            },
          },
        }
      )
    );
    expect(response).toEqual(
      expect.objectContaining({
        index: searchObjectIndex,
        notificationData: expect.objectContaining({
          discord: discordNotificationConfig,
        }),
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
          index: searchObjectIndex,
          notificationData: expect.objectContaining({
            discord: discordNotificationConfig,
          }),
        }),
      ],
    });
  });
});
