import { APIGatewayProxyEvent } from "aws-lambda";
import { isLeft, right } from "fp-ts/lib/Either";
import { SearchObjectUserData } from "../../domain/models/userItem";
import { User } from "../../domain/models/user";
import { fromEither, newLowerCase, newPositiveInteger } from "../../lib/iots";
import { apiGetUser } from "./shared";
import { handler } from "./updateSearchObject";
import { makePutSearchObject } from "../../adapters/userStore/putSearchObject";

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

const defaultUser: User = {
  id: "some-id",
  email: "some-email",
  subscriptionStatus: "ACTIVE",
  subscriptionType: "NORMAL",
  nofSearchObjects: newPositiveInteger(1),
};

const defaultRequestData: SearchObjectUserData = {
  keyword: newLowerCase("some_keyword"),
  searchData: {
    twitter: {
      enabledStatus: "ENABLED",
    },
  },
};

const buildEvent = (user: User, requestData: SearchObjectUserData) => {
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
  });

  it("handles happy flow", async () => {
    const event = buildEvent(defaultUser, defaultRequestData);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));

    const response = fromEither(
      await handler((event as unknown) as APIGatewayProxyEvent)
    );

    expect(response.statusCode).toEqual(200);
  });

  it("returns forbidden index > nofAllowed", async () => {
    const restrictedUser = {
      ...defaultUser,
      nofSearchObjects: newPositiveInteger(0),
    };
    const event = buildEvent(restrictedUser, defaultRequestData);

    apiGetUserdMock.mockResolvedValueOnce(right(restrictedUser));

    const response = await handler((event as unknown) as APIGatewayProxyEvent);
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
    } as SearchObjectUserData);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));

    fromEither(await handler((event as unknown) as APIGatewayProxyEvent));

    expect(putSearchObjectMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ...defaultRequestData,
        id: defaultUser.id,
      })
    );
  });
});
