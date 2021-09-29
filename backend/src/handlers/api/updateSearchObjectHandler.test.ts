import { isLeft, right } from "fp-ts/lib/Either";
import { User } from "@src/domain/models/user";
import { apiGetUser, buildApiRequestEvent } from "./shared";
import { handler } from "./updateSearchObjectHandler";
import { makeUpdateSearchObject } from "@src/adapters/userStore/updateSearchObject";
import { makeGetSearchObject } from "@src/adapters/userStore/getSearchObject";
import {
  SearchObjectDomain,
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
import { PartialDeep } from "type-fest";

jest.mock("./shared", () => ({
  ...jest.requireActual("./shared"), // imports all actual implmentations (useful to only mock one export of a module)
  apiGetUser: jest.fn(),
}));
const apiGetUserdMock = apiGetUser as jest.MockedFunction<typeof apiGetUser>;

jest.mock("@src/adapters/userStore/updateSearchObject", () => ({
  ...jest.requireActual("@src/adapters/userStore/updateSearchObject"),
  makeUpdateSearchObject: jest.fn(),
}));
const makeUpdateSearchObjectMock =
  makeUpdateSearchObject as jest.MockedFunction<typeof makeUpdateSearchObject>;
const updateSearchObjectMock = jest.fn().mockResolvedValue(right("OK"));
makeUpdateSearchObjectMock.mockReturnValue(updateSearchObjectMock);

jest.mock("@src/adapters/userStore/getSearchObject", () => ({
  ...jest.requireActual("@src/adapters/userStore/getSearchObject"),
  makeGetSearchObject: jest.fn(),
}));
const makeGetSearchObjectMock = makeGetSearchObject as jest.MockedFunction<
  typeof makeGetSearchObject
>;
const getSearchObjectMock = jest.fn();
makeGetSearchObjectMock.mockReturnValue(getSearchObjectMock);

const defaultUser: User = {
  id: "some-id",
  email: "some-email",
  subscription: {
    status: "ACTIVE",
    type: "NORMAL",
    nofSearchObjects: newPositiveInteger(1),
  },
};

const defaultRequestData: SearchObjectUserDataDomain =
  defaultSearchObjectDataDomain;

const buildEvent = (user: User, requestData: SearchObjectUserDataIo) => {
  return buildApiRequestEvent({
    user,
    body: requestData,
    pathParameters: { index: 0 },
  });
};

describe("handlers/api/updateSearchObject", () => {
  beforeEach(() => {
    apiGetUserdMock.mockReset();
    getSearchObjectMock.mockReset();
  });

  it("handles happy flow", async () => {
    const event = buildEvent(defaultUser, defaultRequestData);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));
    getSearchObjectMock.mockResolvedValueOnce(right(defaultSearchObjectDomain));

    const response = fromEither(await handler(event));

    expect(response.statusCode).toEqual(200);
  });

  it("returns not_found if search object doesnt exist", async () => {
    const event = buildEvent(defaultUser, defaultRequestData);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));

    getSearchObjectMock.mockResolvedValueOnce(right("NOT_FOUND"));

    const response = await handler(event);
    expect(isLeft(response)).toBeTruthy();
    if (isLeft(response)) {
      expect(response.left.statusCode).toEqual(404);
    }
    expect(updateSearchObjectMock).not.toHaveBeenCalled();
  });

  it("returns forbidden index > nofAllowed", async () => {
    const restrictedUser = deepmergeSafe(defaultUser, {
      subscription: {
        nofSearchObjects: newPositiveInteger(0),
      },
    });
    const event = buildEvent(restrictedUser, defaultRequestData);

    apiGetUserdMock.mockResolvedValueOnce(right(restrictedUser));
    getSearchObjectMock.mockResolvedValueOnce(right(defaultSearchObjectDomain));

    const response = await handler(event);
    expect(isLeft(response)).toBeTruthy();
    if (isLeft(response)) {
      expect(response.left.statusCode).toEqual(403);
    }
    expect(updateSearchObjectMock).not.toHaveBeenCalled();
  });

  it("removes id and other potential injections from request", async () => {
    const event = buildEvent(defaultUser, {
      ...defaultRequestData,
      id: "some-other-id",
      lockedStatus: "UNLOCKED",
    } as SearchObjectUserDataIo);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));
    getSearchObjectMock.mockResolvedValueOnce(right(defaultSearchObjectDomain));

    fromEither(await handler(event));

    expect(updateSearchObjectMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ...defaultRequestData,
        id: defaultUser.id,
      })
    );
  });

  it("can handle requests with partial data", async () => {
    const event = buildEvent(defaultUser, {
      ...defaultRequestData,
      notificationData: {},
    } as SearchObjectUserDataIo);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));

    const existingSearchObjct: PartialDeep<SearchObjectDomain> = {
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
    getSearchObjectMock.mockResolvedValueOnce(right(existingSearchObjct));

    fromEither(await handler(event));

    expect(updateSearchObjectMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ...defaultRequestData,
        notificationData: existingSearchObjct.notificationData,
      })
    );
  });

  it("validates keyword", async () => {
    const event = buildEvent(defaultUser, {
      ...defaultRequestData,
      keyword: newLowerCase("too many words invalid keyword"),
    });
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));
    getSearchObjectMock.mockResolvedValueOnce(right(defaultSearchObjectDomain));

    const response = await handler(event);

    expect(isLeft(response)).toBeTruthy();
    if (isLeft(response)) {
      expect(response.left.statusCode).toEqual(400);
      expect(response.left.errorCode).toEqual("INVALID_KEYWORD");
    }
    expect(updateSearchObjectMock).not.toHaveBeenCalled();
  });
});
