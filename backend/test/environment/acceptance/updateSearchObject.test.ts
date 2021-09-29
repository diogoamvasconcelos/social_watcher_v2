import { DiscordNotificationConfig } from "@src/domain/models/notificationJob";
import {
  getClient as getApiClient,
  getSearchObjects,
  updateSearchObject,
} from "@src/lib/apiClient/apiClient";
import {
  fromEither,
  newLowerCase,
  newPositiveInteger,
  PositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { Awaited } from "@src/lib/types";
import { uuid } from "@src/lib/uuid";
import { getEnvTestConfig } from "@test/lib/config";
import {
  createTestUser,
  createUserSearchObject,
  deleteKeyword,
  deleteUser,
  getIdToken,
  updateUserSubscription,
} from "./steps";
import { SearchObjectUserDataIo } from "@src/domain/models/userItem";
import { isLeft } from "fp-ts/lib/Either";

const config = getEnvTestConfig();
const apiClient = getApiClient(config.apiEndpoint);

jest.setTimeout(20000);

describe("update searchObject e2e test", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let userToken: string;
  let searchObjectIndex: PositiveInteger;
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

  it("updateSearchObject works", async () => {
    const initialState = await createUserSearchObject({
      token: userToken,
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
          token: userToken,
        },
        { index: searchObjectIndex, userData }
      )
    );
    expect(response).toEqual(expectedResponse);

    const getSearchObjectsResponse = fromEither(
      await getSearchObjects({
        client: apiClient,
        token: userToken,
      })
    );
    expect(getSearchObjectsResponse).toEqual({
      items: [expectedResponse],
    });
  });

  it("can update discord notification config", async () => {
    const initialGetSearchObjectsResponse = fromEither(
      await getSearchObjects({
        client: apiClient,
        token: userToken,
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
          token: userToken,
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
        token: userToken,
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

  it("updateSearchObject can't update non-exiting searchObjects", async () => {
    // increase users's nofSearchObjects
    await updateUserSubscription({
      userId: testUser.id,
      updatedData: { nofSearchObjects: newPositiveInteger(2) },
    });

    const responseEither = await updateSearchObject(
      {
        client: apiClient,
        token: userToken,
      },
      { index: newPositiveInteger(1), userData: { keyword } }
    );

    expect(
      isLeft(responseEither) && typeof responseEither.left != "string"
    ).toBeTruthy();
    if (isLeft(responseEither) && typeof responseEither.left != "string") {
      expect(responseEither.left.status).toEqual(404);
    }
  });
});
