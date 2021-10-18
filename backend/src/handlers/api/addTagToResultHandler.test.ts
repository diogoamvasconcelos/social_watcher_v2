// TODO:
// - happy flow
// - duplicate test
// - searchResult does not exist
// - user doesn't have resultTag

import { fromEither } from "@diogovasconcelos/lib/iots";
import { SearchResult } from "@src/domain/models/searchResult";
import { User } from "@src/domain/models/user";
import { uuid } from "@src/lib/uuid";
import { handler } from "./addTagToResultHandler";
import { AddTagToResultRequestData } from "./models/addTagToResult";
import { buildApiRequestEvent } from "./shared";
import { makeGetSearchResult } from "@src/adapters/searchResultsStore/getSearchResult";
import { makeGetResultTag } from "@src/adapters/userStore/getResultTag";
import { makeAddTagToSearchResult } from "@src/adapters/searchResultsStore/addTagToSearchResult";
import {
  buildResultTag,
  buildSearchResult,
  buildUser,
} from "@test/lib/builders";
import { right } from "fp-ts/Either";

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
  requestData: AddTagToResultRequestData
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
  });
});
