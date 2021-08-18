import { APIGatewayProxyEvent } from "aws-lambda";
import { isLeft, right } from "fp-ts/lib/Either";
import { User } from "../../domain/models/user";
import { apiGetUser } from "./shared";
import { handler } from "./createSearchObject";
import { makeCreateSearchObject } from "../../adapters/userStore/createSearchObject";
import { makeGetSearchObjectsForUser } from "../../adapters/userStore/getSearchObjectsForUser";
import {
  SearchObjectUserDataDomain,
  SearchObjectUserDataIo,
} from "../../domain/models/userItem";
import { fromEither, newPositiveInteger } from "@diogovasconcelos/lib/iots";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { defaultSearchObjectDataDomain } from "../../../test/lib/default";

jest.mock("./shared", () => ({
  ...jest.requireActual("./shared"), // imports all actual implmentations (useful to only mock one export of a module)
  apiGetUser: jest.fn(),
}));
const apiGetUserdMock = apiGetUser as jest.MockedFunction<typeof apiGetUser>;

jest.mock("../../adapters/userStore/createSearchObject", () => ({
  ...jest.requireActual("../../adapters/userStore/createSearchObject"),
  makeCreateSearchObject: jest.fn(),
}));
const makeCreateSearchObjectMock =
  makeCreateSearchObject as jest.MockedFunction<typeof makeCreateSearchObject>;
const createSearchObjectMock = jest.fn().mockResolvedValue(right("OK"));
makeCreateSearchObjectMock.mockReturnValue(createSearchObjectMock);

jest.mock("../../adapters/userStore/getSearchObjectsForUser", () => ({
  ...jest.requireActual("../../adapters/userStore/getSearchObjectsForUser"),
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
  return {
    requestContext: {
      authorizer: {
        claims: {
          sub: user.id,
          email: user.email,
        },
      },
    },
    body: JSON.stringify(requestData),
  };
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

    const response = fromEither(
      await handler(event as unknown as APIGatewayProxyEvent)
    );

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
      right([defaultSearchObjectDataDomain])
    );

    const response = fromEither(
      await handler(event as unknown as APIGatewayProxyEvent)
    );

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
      right([defaultSearchObjectDataDomain, defaultSearchObjectDataDomain])
    );

    const response = await handler(event as unknown as APIGatewayProxyEvent);
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
      right([defaultSearchObjectDataDomain]) // so it should put in index=1
    );

    fromEither(await handler(event as unknown as APIGatewayProxyEvent));

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

    fromEither(await handler(event as unknown as APIGatewayProxyEvent));

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
});
