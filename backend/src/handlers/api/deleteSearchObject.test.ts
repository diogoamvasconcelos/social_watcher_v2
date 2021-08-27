// TODOOO: test it only tries to delete if it exists and it is allowed

import { fromEither, newPositiveInteger } from "@diogovasconcelos/lib/iots";
import { deleteSearchObjectAndPrune } from "@src/domain/controllers/deleteSearchObjectAndPrune";
import { makeGetSearchObject } from "@src/adapters/userStore/getSearchObject";
import { User } from "@src/domain/models/user";
import { apiGetUser, buildApiRequestEvent } from "./shared";
import { isLeft, right } from "fp-ts/lib/Either";
import { handler } from "./deleteSearchObject";
import { defaultSearchObjectDomain } from "@test/lib/default";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";

jest.mock("./shared", () => ({
  ...jest.requireActual("./shared"),
  apiGetUser: jest.fn(),
}));
const apiGetUserdMock = apiGetUser as jest.MockedFunction<typeof apiGetUser>;

jest.mock("@src/adapters/userStore/getSearchObject", () => ({
  ...jest.requireActual("@src/adapters/userStore/getSearchObject"),
  makeGetSearchObject: jest.fn(),
}));
const makeGetSearchObjectMock = makeGetSearchObject as jest.MockedFunction<
  typeof makeGetSearchObject
>;
const getSearchObjectMock = jest.fn();
makeGetSearchObjectMock.mockReturnValue(getSearchObjectMock);

jest.mock("@src/domain/controllers/deleteSearchObjectAndPrune");
const deleteSearchObjectAndPruneMock =
  deleteSearchObjectAndPrune as jest.MockedFunction<
    typeof deleteSearchObjectAndPrune
  >;

const defaultUser: User = {
  id: "some-id",
  email: "some-email",
  subscription: {
    status: "ACTIVE",
    type: "NORMAL",
    nofSearchObjects: newPositiveInteger(1),
  },
};

const buildEvent = (user: User) => {
  return buildApiRequestEvent({
    user,
    pathParameters: { index: 0 },
  });
};

describe("handlers/api/deleteSearchObject", () => {
  beforeEach(() => {
    apiGetUserdMock.mockReset();
    getSearchObjectMock.mockReset();
    deleteSearchObjectAndPruneMock.mockReset();
  });

  it("handles happy flow", async () => {
    const event = buildEvent(defaultUser);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));
    getSearchObjectMock.mockResolvedValueOnce(right(defaultSearchObjectDomain));
    deleteSearchObjectAndPruneMock.mockResolvedValueOnce(right("OK"));

    const response = fromEither(await handler(event));

    expect(response.statusCode).toEqual(200);
    expect(deleteSearchObjectAndPruneMock).toHaveBeenCalled();
  });

  it("returns not_found if search object doesnt exist", async () => {
    const event = buildEvent(defaultUser);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));
    getSearchObjectMock.mockResolvedValueOnce(right("NOT_FOUND"));

    const response = await handler(event);
    expect(isLeft(response)).toBeTruthy();
    if (isLeft(response)) {
      expect(response.left.statusCode).toEqual(404);
    }
    expect(deleteSearchObjectAndPruneMock).not.toHaveBeenCalled();
  });

  it("returns forbidden index > nofAllowed", async () => {
    const restrictedUser = deepmergeSafe(defaultUser, {
      subscription: {
        nofSearchObjects: newPositiveInteger(0),
      },
    });
    const event = buildEvent(restrictedUser);

    apiGetUserdMock.mockResolvedValueOnce(right(restrictedUser));
    getSearchObjectMock.mockResolvedValueOnce(right(defaultSearchObjectDomain));

    const response = await handler(event);
    expect(isLeft(response)).toBeTruthy();
    if (isLeft(response)) {
      expect(response.left.statusCode).toEqual(403);
    }
    expect(deleteSearchObjectAndPruneMock).not.toHaveBeenCalled();
  });
});
