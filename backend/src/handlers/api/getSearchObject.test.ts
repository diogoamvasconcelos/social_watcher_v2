import { APIGatewayProxyEvent } from "aws-lambda";
import { isLeft, right } from "fp-ts/lib/Either";
import { User } from "../../domain/models/user";
import { apiGetUser } from "./shared";
import { handler } from "./getSearchObject";
import { makeGetSearchObject } from "../../adapters/userStore/getSearchObject";
import { fromEither, newPositiveInteger } from "@diogovasconcelos/lib/iots";
import { defaultSearchObjectDataDomain } from "../../../test/lib/default";

jest.mock("./shared", () => ({
  ...jest.requireActual("./shared"), // imports all actual implmentations (useful to only mock one export of a module)
  apiGetUser: jest.fn(),
}));
const apiGetUserdMock = apiGetUser as jest.MockedFunction<typeof apiGetUser>;

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

const buildEvent = (user: User, index: number) => {
  return {
    requestContext: {
      authorizer: {
        claims: {
          sub: user.id,
          email: user.email,
        },
      },
    },
    pathParameters: {
      index,
    },
  };
};

describe("handlers/api/getSearchObject", () => {
  beforeEach(() => {
    apiGetUserdMock.mockReset();
    getSearchObjectMock.mockReset();
  });

  it("handles happy flow", async () => {
    const event = buildEvent(defaultUser, 0);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));
    getSearchObjectMock.mockResolvedValueOnce(
      right(defaultSearchObjectDataDomain)
    );

    const response = fromEither(
      await handler(event as unknown as APIGatewayProxyEvent)
    );

    expect(response.statusCode).toEqual(200);
  });

  it("returns not_found", async () => {
    const event = buildEvent(defaultUser, 0);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));
    getSearchObjectMock.mockResolvedValueOnce(right("NOT_FOUND"));

    const response = await handler(event as unknown as APIGatewayProxyEvent);

    expect(isLeft(response)).toBeTruthy();
    if (isLeft(response)) {
      expect(response.left.statusCode).toEqual(404);
    }
  });

  it("returns forbidden index > nofAllowed", async () => {
    const event = buildEvent(defaultUser, 1);

    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));
    getSearchObjectMock.mockResolvedValueOnce(right("NOT_FOUND"));

    const response = await handler(event as unknown as APIGatewayProxyEvent);
    expect(isLeft(response)).toBeTruthy();
    if (isLeft(response)) {
      expect(response.left.statusCode).toEqual(403);
    }
  });
});
