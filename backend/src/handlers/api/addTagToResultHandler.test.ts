import { fromEither } from "@diogovasconcelos/lib/iots";
import { SearchResult } from "@src/domain/models/searchResult";
import { User } from "@src/domain/models/user";
import { uuid } from "@src/lib/uuid";
import { handler } from "./addTagToResultHandler";
import { AddTagToResultUserData } from "./models/addTagToResult";
import { buildApiRequestEvent } from "./shared";
import { makeGetSearchResult } from "@src/adapters/searchResultsStore/getSearchResult";
import { makeGetResultTag } from "@src/adapters/userStore/getResultTag";
import { makeAddTagToSearchResult } from "@src/adapters/searchResultsStore/addTagToSearchResult";
import {
  buildResultTag,
  buildSearchResult,
  buildUser,
} from "@test/lib/builders";
import { right, isLeft } from "fp-ts/Either";

const defaultSearchResult = buildSearchResult();
const defaultUser = buildUser();
const defaultResultTag = buildResultTag();

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

jest.mock("@src/adapters/searchResultsStore/addTagToSearchResult");
const makeAddTagToSearchResultMock =
  makeAddTagToSearchResult as jest.MockedFunction<
    typeof makeAddTagToSearchResult
  >;
const addTagToSearchResultMock = jest
  .fn()
  .mockResolvedValue(right(defaultSearchResult));
makeAddTagToSearchResultMock.mockReturnValue(addTagToSearchResultMock);

const buildEvent = (
  user: User,
  resultId: SearchResult["id"],
  requestData: AddTagToResultUserData
) => {
  return buildApiRequestEvent({
    user,
    pathParameters: { resultId },
    body: requestData,
  });
};

describe("handlers/api/addTagToResultHandler", () => {
  beforeEach(() => {
    getSearchResultMock.mockReset();
    getResultTagMock.mockReset();
  });

  it("handles happy flow", async () => {
    const newTagId = uuid();
    const event = buildEvent(defaultUser, "some-result", { tagId: newTagId });

    getSearchResultMock.mockResolvedValueOnce(right(defaultSearchResult));
    getResultTagMock.mockResolvedValueOnce(right(defaultResultTag));

    const response = fromEither(await handler(event));

    expect(response.statusCode).toEqual(200);
    expect(addTagToSearchResultMock).toBeCalledTimes(1);
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
    expect(addTagToSearchResultMock).not.toBeCalled();
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
    expect(addTagToSearchResultMock).not.toBeCalled();
  });

  it("returns 400 when tag has already been added to result", async () => {
    const event = buildEvent(defaultUser, "some-result", {
      tagId: defaultResultTag.tagId,
    });
    const searchResultWithTag = buildSearchResult({
      tags: [defaultResultTag.tagId],
    });

    getSearchResultMock.mockResolvedValueOnce(right(searchResultWithTag));
    getResultTagMock.mockResolvedValueOnce(right(defaultResultTag));

    const response = await handler(event);

    expect(isLeft(response)).toBeTruthy();
    if (isLeft(response)) {
      expect(response.left.statusCode).toEqual(400);
      expect(response.left.errorCode).toEqual("TAG_ALREADY_ADDED");
    }
    expect(addTagToSearchResultMock).not.toBeCalled();
  });
});
