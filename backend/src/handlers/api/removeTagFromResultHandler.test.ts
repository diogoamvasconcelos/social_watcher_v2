import { fromEither } from "@diogovasconcelos/lib/iots";
import { SearchResult } from "@src/domain/models/searchResult";
import { User } from "@src/domain/models/user";
import { handler } from "./removeTagFromResultHandler";
import { RemoveTagFromResultUserData } from "./models/removeTagFromResult";
import { buildApiRequestEvent } from "./shared";
import { makeGetSearchResult } from "@src/adapters/searchResultsStore/getSearchResult";
import { makeGetResultTag } from "@src/adapters/userStore/getResultTag";
import { makeRemoveTagFromSearchResult } from "@src/adapters/searchResultsStore/removeTagFromSearchResult";
import {
  buildResultTag,
  buildSearchResult,
  buildUser,
} from "@test/lib/builders";
import { right, isLeft } from "fp-ts/Either";

const defaultResultTag = buildResultTag();
const defaultSearchResult = buildSearchResult({
  tags: [defaultResultTag.tagId],
});
const defaultUser = buildUser();

jest.mock("@src/adapters/searchResultsStore/getSearchResult");
const makeGetSearchResultMock = makeGetSearchResult as jest.MockedFunction<
  typeof makeGetSearchResult
>;
const getSearchResultMock = jest.fn();
makeGetSearchResultMock.mockReturnValue(getSearchResultMock);

jest.mock("@src/adapters/userStore/getResultTag");
const makeGetResultTagMock = makeGetResultTag as jest.MockedFunction<
  typeof makeGetResultTag
>;
const getResultTagMock = jest.fn();
makeGetResultTagMock.mockReturnValue(getResultTagMock);

jest.mock("@src/adapters/searchResultsStore/removeTagFromSearchResult");
const makeRemoveTagFromSearchResultMock =
  makeRemoveTagFromSearchResult as jest.MockedFunction<
    typeof makeRemoveTagFromSearchResult
  >;
const removeTagFromSearchResultMock = jest
  .fn()
  .mockResolvedValue(right(defaultSearchResult));
makeRemoveTagFromSearchResultMock.mockReturnValue(
  removeTagFromSearchResultMock
);

const buildEvent = (
  user: User,
  resultId: SearchResult["id"],
  requestData: RemoveTagFromResultUserData
) => {
  return buildApiRequestEvent({
    user,
    pathParameters: { id: resultId },
    body: requestData,
  });
};

describe("handlers/api/removeTagFromResultHandler", () => {
  beforeEach(() => {
    getSearchResultMock.mockReset();
    getResultTagMock.mockReset();
  });

  it("handles happy flow", async () => {
    const event = buildEvent(defaultUser, "some-result", {
      tagId: defaultResultTag.tagId,
    });

    getSearchResultMock.mockResolvedValueOnce(right(defaultSearchResult));
    getResultTagMock.mockResolvedValueOnce(right(defaultResultTag));

    const response = fromEither(await handler(event));

    expect(response.statusCode).toEqual(200);
    expect(removeTagFromSearchResultMock).toBeCalledTimes(1);
  });

  it("returns 404 when searchResult doesn't exist", async () => {
    const event = buildEvent(defaultUser, "some-result", {
      tagId: defaultResultTag.tagId,
    });

    getSearchResultMock.mockResolvedValueOnce(right("NOT_FOUND"));
    getResultTagMock.mockResolvedValueOnce(right(defaultResultTag));

    const response = await handler(event);

    expect(isLeft(response)).toBeTruthy();
    if (isLeft(response)) {
      expect(response.left.statusCode).toEqual(404);
      expect(response.left.errorCode).toEqual("SEARCH_RESULT_NOT_FOUND");
    }
    expect(removeTagFromSearchResultMock).not.toBeCalled();
  });

  it("returns 404 when user doesn't have the result tag", async () => {
    const event = buildEvent(defaultUser, "some-result", {
      tagId: defaultResultTag.tagId,
    });

    getSearchResultMock.mockResolvedValueOnce(right(defaultSearchResult));
    getResultTagMock.mockResolvedValueOnce(right("NOT_FOUND"));

    const response = await handler(event);

    expect(isLeft(response)).toBeTruthy();
    if (isLeft(response)) {
      expect(response.left.statusCode).toEqual(404);
      expect(response.left.errorCode).toEqual("RESULT_TAG_NOT_FOUND");
    }
    expect(removeTagFromSearchResultMock).not.toBeCalled();
  });

  it("returns 400 when tag is missing from result", async () => {
    const event = buildEvent(defaultUser, "some-result", {
      tagId: defaultResultTag.tagId,
    });
    const searchResultWithTag = buildSearchResult({
      tags: [buildResultTag().tagId], // some other tag
    });

    getSearchResultMock.mockResolvedValueOnce(right(searchResultWithTag));
    getResultTagMock.mockResolvedValueOnce(right(defaultResultTag));

    const response = await handler(event);

    expect(isLeft(response)).toBeTruthy();
    if (isLeft(response)) {
      expect(response.left.statusCode).toEqual(400);
      expect(response.left.errorCode).toEqual("TAG_MISSING_IN_RESULT");
    }
    expect(removeTagFromSearchResultMock).not.toBeCalled();
  });
});
