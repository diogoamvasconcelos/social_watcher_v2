import { APIGatewayProxyEvent } from "aws-lambda";
import { isLeft, right } from "fp-ts/lib/Either";
import { User } from "../../domain/models/user";
import { apiGetUser } from "./shared";
import { handler } from "./updateSearchObject";
import { makePutSearchObject } from "../../adapters/userStore/putSearchObject";
import { makeGetSearchObject } from "../../adapters/userStore/getSearchObject";
import { SearchObjectUserDataIo } from "../../domain/models/userItem";
import {
  fromEither,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";

jest.mock("./shared", () => ({
  ...jest.requireActual("./shared"), // imports all actual implmentations (useful to only mock one export of a module)
  apiGetUser: jest.fn(),
}));
const apiGetUserdMock = apiGetUser as jest.MockedFunction<typeof apiGetUser>;

jest.mock("../../adapters/userStore/putSearchObject", () => ({
  ...jest.requireActual("../../adapters/userStore/putSearchObject"),
  makePutSearchObject: jest.fn(),
}));
const makePutSearchObjectMock = makePutSearchObject as jest.MockedFunction<
  typeof makePutSearchObject
>;
const putSearchObjectMock = jest.fn().mockResolvedValue(right("OK"));
makePutSearchObjectMock.mockReturnValue(putSearchObjectMock);

jest.mock("../../adapters/userStore/getSearchObject", () => ({
  ...jest.requireActual("../../adapters/userStore/getSearchObject"),
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

const defaultRequestData: SearchObjectUserDataIo = {
  keyword: newLowerCase("some_keyword"),
  searchData: {
    twitter: {
      enabledStatus: "ENABLED",
    },
    reddit: {
      enabledStatus: "DISABLED",
      over18: false,
    },
    hackernews: {
      enabledStatus: "DISABLED",
    },
  },
  notificationData: {
    discordNotification: {
      enabledStatus: "ENABLED",
      channel: "some-channel",
      bot: {
        credentials: {
          token: "some-token",
        },
      },
    },
    slackNotification: {
      enabledStatus: "ENABLED",
      channel: "some-channel",
    },
  },
};

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
    pathParameters: {
      index: 0,
    },
  };
};

describe("handlers/api/updateSearchObject", () => {
  beforeEach(() => {
    apiGetUserdMock.mockReset();
    getSearchObjectMock.mockReset();
  });

  it("handles happy flow", async () => {
    const event = buildEvent(defaultUser, defaultRequestData);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));
    getSearchObjectMock.mockResolvedValueOnce(right("NOT_FOUND"));

    const response = fromEither(
      await handler(event as unknown as APIGatewayProxyEvent)
    );

    expect(response.statusCode).toEqual(200);
  });

  it("returns forbidden index > nofAllowed", async () => {
    const restrictedUser = deepmergeSafe(defaultUser, {
      subscription: {
        nofSearchObjects: newPositiveInteger(0),
      },
    });
    const event = buildEvent(restrictedUser, defaultRequestData);

    apiGetUserdMock.mockResolvedValueOnce(right(restrictedUser));
    getSearchObjectMock.mockResolvedValueOnce(right("NOT_FOUND"));

    const response = await handler(event as unknown as APIGatewayProxyEvent);
    expect(isLeft(response)).toBeTruthy();
    if (isLeft(response)) {
      expect(response.left.statusCode).toEqual(403);
    }
  });

  it("removes id and other potential injections from request", async () => {
    const event = buildEvent(defaultUser, {
      ...defaultRequestData,
      id: "some-other-id",
      lockedStatus: "UNLOCKED",
    } as SearchObjectUserDataIo);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));
    getSearchObjectMock.mockResolvedValueOnce(right("NOT_FOUND"));

    fromEither(await handler(event as unknown as APIGatewayProxyEvent));

    expect(putSearchObjectMock).toHaveBeenCalledWith(
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

    const existingSearchObjct = {
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
        discordNotification: {
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

    fromEither(await handler(event as unknown as APIGatewayProxyEvent));

    expect(putSearchObjectMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ...defaultRequestData,
        notificationData: existingSearchObjct.notificationData,
      })
    );
  });
});
