import { isLeft, right } from "fp-ts/lib/Either";
import { User } from "@src/domain/models/user";
import { apiGetUser, buildApiRequestEvent } from "./shared";
import { handler } from "./getSearchObjectHandler";
import { makeGetSearchObject } from "@src/adapters/userStore/getSearchObject";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { buildSearchObjectDomain, buildUser } from "@test/lib/builders";

const defaultSearchObjectDomain = buildSearchObjectDomain();
const defaultUser = buildUser();

jest.mock("./shared", () => ({
  ...jest.requireActual("./shared"), // imports all actual implmentations (useful to only mock one export of a module)
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

const buildEvent = (user: User, index: number) => {
  return buildApiRequestEvent({
    user,
    pathParameters: { index },
  });
};

describe("handlers/api/getSearchObject", () => {
  beforeEach(() => {
    apiGetUserdMock.mockReset();
    getSearchObjectMock.mockReset();
  });

  it("handles happy flow", async () => {
    const event = buildEvent(defaultUser, 0);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));
    getSearchObjectMock.mockResolvedValueOnce(right(defaultSearchObjectDomain));

    const response = fromEither(await handler(event));

    expect(response.statusCode).toEqual(200);
  });

  it("returns not_found", async () => {
    const event = buildEvent(defaultUser, 0);
    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));
    getSearchObjectMock.mockResolvedValueOnce(right("NOT_FOUND"));

    const response = await handler(event);

    expect(isLeft(response)).toBeTruthy();
    if (isLeft(response)) {
      expect(response.left.statusCode).toEqual(404);
    }
  });

  it("returns forbidden index > nofAllowed", async () => {
    const event = buildEvent(defaultUser, 1);

    apiGetUserdMock.mockResolvedValueOnce(right(defaultUser));
    getSearchObjectMock.mockResolvedValueOnce(right("NOT_FOUND"));

    const response = await handler(event);
    expect(isLeft(response)).toBeTruthy();
    if (isLeft(response)) {
      expect(response.left.statusCode).toEqual(403);
    }
  });
});
