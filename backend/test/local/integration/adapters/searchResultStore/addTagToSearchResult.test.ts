import { isLeft } from "fp-ts/lib/Either";
import { client, preparesGenericTable } from "@test/lib/dynamoDb";
import { getLogger } from "@src/lib/logger";
import { uuid } from "@src/lib/uuid";
import { makeGetSearchResult } from "@src/adapters/searchResultsStore/getSearchResult";
import { makePutSearchResults } from "@src/adapters/searchResultsStore/putSearchResults";
import { buildSearchResult } from "@test/lib/builders";
import { makeAddTagToSearchResult } from "@src/adapters/searchResultsStore/addTagToSearchResult";
import { fromEither } from "@diogovasconcelos/lib/iots";

describe("adapters/addTagToSearchResult", () => {
  const logger = getLogger();
  const tableName: string = uuid();

  const getSearchResultFn = makeGetSearchResult(client, tableName);
  const putSearchResultsFn = makePutSearchResults(client, tableName);
  const addTagToSearchResultsFn = makeAddTagToSearchResult(client, tableName);

  const newTagId = uuid();
  const existingTagId = uuid();

  beforeEach(async () => {
    await preparesGenericTable(tableName);
  });

  it("successfully appends a tag to empty list", async () => {
    const searchResult = buildSearchResult();

    fromEither(await putSearchResultsFn(logger, [searchResult]));

    const initialState = fromEither(
      await getSearchResultFn(logger, searchResult.id)
    );
    if (initialState === "NOT_FOUND") {
      fail("didn't find searchResult initial state");
    }

    expect(initialState.tags).toBeUndefined;

    const updatedResult = fromEither(
      await addTagToSearchResultsFn(logger, initialState, newTagId)
    );

    expect(updatedResult.tags).toEqual([newTagId]);
  });

  it("successfully appends a tag to existing list", async () => {
    const searchResult = buildSearchResult({ tags: [existingTagId] });

    fromEither(await putSearchResultsFn(logger, [searchResult]));

    const initialState = fromEither(
      await getSearchResultFn(logger, searchResult.id)
    );
    if (initialState === "NOT_FOUND") {
      fail("didn't find searchResult initial state");
    }

    expect(initialState.tags).toBeUndefined;

    const updatedResult = fromEither(
      await addTagToSearchResultsFn(logger, initialState, newTagId)
    );

    expect(updatedResult.tags).toEqual([existingTagId, newTagId]);
  });

  it("fails when trying to appends duplicaed", async () => {
    const searchResult = buildSearchResult({ tags: [existingTagId] });

    fromEither(await putSearchResultsFn(logger, [searchResult]));

    const initialState = fromEither(
      await getSearchResultFn(logger, searchResult.id)
    );
    if (initialState === "NOT_FOUND") {
      fail("didn't find searchResult initial state");
    }

    expect(initialState.tags).toBeUndefined;

    const updatedResultEither = await addTagToSearchResultsFn(
      logger,
      initialState,
      existingTagId
    );
    expect(isLeft(updatedResultEither)).toBeTruthy();
  });
});
