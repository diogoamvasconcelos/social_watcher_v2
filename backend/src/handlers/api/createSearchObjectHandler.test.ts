import { isLeft, right } from "fp-ts/lib/Either";
import { User } from "@src/domain/models/user";
import { apiGetUser, buildApiRequestEvent } from "./shared";
import { handler } from "./createSearchObjectHandler";
import { makeCreateSearchObject } from "@src/adapters/userStore/createSearchObject";
import { makeGetSearchObjectsForUser } from "@src/adapters/userStore/getSearchObjectsForUser";
import {
  SearchObjectUserDataDomain,
  SearchObjectUserDataIo,
} from "@src/domain/models/userItem";
import {
  fromEither,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import {
  defaultSearchObjectDataDomain,
  defaultSearchObjectDomain,
} from "@test/lib/default";

// mock: apiGetUser
jest.mock("./shared", () => ({
  ...jest.requireActual("./shared"), // imports all actual implmentations (useful to only mock one export of a module)
  apiGetUser: jest.fn(),
}));
const apiGetUserdMock = apiGetUser as jest.MockedFunction<typeof apiGetUser>;

// mock: createSearchObject
jest.mock("@src/adapters/userStore/createSearchObject", () => ({
  ...jest.requireActual("@src/adapters/userStore/createSearchObject"),
  makeCreateSearchObject: jest.fn(),
}));
const makeCreateSearchObjectMock =
  makeCreateSearchObject as jest.MockedFunction<typeof makeCreateSearchObject>;
const createSearchObjectMock = jest.fn().mockResolvedValue(right("OK"));
makeCreateSearchObjectMock.mockReturnValue(createSearchObjectMock);

// mock: getSearchObjectsForUser
jest.mock("@src/adapters/userStore/getSearchObjectsForUser", () => ({
  ...jest.requireActual("@src/adapters/userStore/getSearchObjectsForUser"),
  makeGetSearchObjectsForUser: jest.fn(),
}));
const makeGetSearchObjectsForUserMock =
  makeGetSearchObjectsForUser as jest.MockedFunction<
    typeof makeGetSearchObjectsForUser
  >;
const getSearchObjectsForUserMock = jest.fn();
makeGetSearchObjectsForUserMock.mockReturnValue(getSearchObjectsForUserMock);

const defaultUser: User = {
  id: "some-id",
  email: "some-email",
  subscription: {
    status: "ACTIVE",
    type: "NORMAL",
    nofSearchObjects: newPositiveInteger(2),
  },
};

const defaultRequestData: SearchObjectUserDataDomain =
  defaultSearchObjectDataDomain;

const buildEvent = (user: User, requestData: SearchObjectUserDataIo) => {
  return buildApiRequestEvent({
    user,
    body: requestData,
  });
};

describe("handlers/api/createSearchObject", () => {
  beforeEach(() => {
    apiGetUserdMock.mockReset();
    getSearchObjectsForUserMock.mockReset();
  });

  it("handles happy flow, no search objects exist", async () => {
    const event = buildEvent(defaultUser, defaultRequestData);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));
    getSearchObjectsForUserMock.mockResolvedValueOnce(right([]));

    const response = fromEither(await handler(event));

    expect(response.statusCode).toEqual(200);
    expect(createSearchObjectMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ...defaultRequestData,
        index: 0,
      })
    );
  });

  it("handles happy flow, one search object available", async () => {
    const event = buildEvent(defaultUser, defaultRequestData);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));
    getSearchObjectsForUserMock.mockResolvedValueOnce(
      right([defaultSearchObjectDomain])
    );

    const response = fromEither(await handler(event));

    expect(response.statusCode).toEqual(200);
    expect(createSearchObjectMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ...defaultRequestData,
        index: 1,
      })
    );
  });

  it("returns forbidden if all seaerchObject already in use", async () => {
    const restrictedUser = deepmergeSafe(defaultUser, {
      subscription: {
        nofSearchObjects: newPositiveInteger(0),
      },
    });
    const event = buildEvent(restrictedUser, defaultRequestData);

    apiGetUserdMock.mockResolvedValueOnce(right(restrictedUser));
    getSearchObjectsForUserMock.mockResolvedValueOnce(
      right([defaultSearchObjectDomain, defaultSearchObjectDomain])
    );

    const response = await handler(event);
    expect(isLeft(response)).toBeTruthy();
    if (isLeft(response)) {
      expect(response.left.statusCode).toEqual(403);
    }
    expect(createSearchObjectMock).not.toHaveBeenCalled();
  });

  it("removes index and other potential injections from request", async () => {
    const event = buildEvent(defaultUser, {
      ...defaultRequestData,
      id: "some-other-id",
      lockedStatus: "UNLOCKED",
    } as SearchObjectUserDataIo);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));
    getSearchObjectsForUserMock.mockResolvedValueOnce(
      right([defaultSearchObjectDomain]) // so it should put in index=1
    );

    fromEither(await handler(event));

    expect(createSearchObjectMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ...defaultRequestData,
        id: defaultUser.id,
        index: 1,
      })
    );
  });

  it("can handle requests with partial data", async () => {
    const partialSearchObjct: SearchObjectUserDataIo = {
      keyword: defaultRequestData.keyword,
      searchData: {
        twitter: {
          enabledStatus: "DISABLED",
        },
        reddit: {
          enabledStatus: "DISABLED",
          over18: false,
        },
      },
      notificationData: {
        discord: {
          enabledStatus: "DISABLED",
          channel: "existing-channel",
          bot: {
            credentials: {
              token: "existing-token",
            },
          },
        },
      },
    };

    const event = buildEvent(defaultUser, partialSearchObjct);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));

    getSearchObjectsForUserMock.mockResolvedValueOnce(right([]));

    fromEither(await handler(event));

    expect(createSearchObjectMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ...partialSearchObjct,
        searchData: expect.objectContaining(partialSearchObjct.searchData),
        notificationData: expect.objectContaining(
          partialSearchObjct.notificationData
        ),
      })
    );
  });

  it("validates keyword", async () => {
    const event = buildEvent(defaultUser, {
      ...defaultRequestData,
      keyword: newLowerCase("too many words invalid keyword"),
    });
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));

    const response = await handler(event);

    expect(isLeft(response)).toBeTruthy();
    if (isLeft(response)) {
      expect(response.left.statusCode).toEqual(400);
      expect(response.left.errorCode).toEqual("INVALID_KEYWORD");
    }
    expect(createSearchObjectMock).not.toHaveBeenCalled();
  });
});
