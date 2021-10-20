import { isLeft } from "fp-ts/lib/Either";
import { client, preparesGenericTable } from "@test/lib/dynamoDb";
import { getLogger } from "@src/lib/logger";
import { uuid } from "@src/lib/uuid";
import { makeGetSearchResult } from "@src/adapters/searchResultsStore/getSearchResult";
import { makePutSearchResults } from "@src/adapters/searchResultsStore/putSearchResults";
import { buildSearchResult } from "@test/lib/builders";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { makeRemoveTagFromSearchResult } from "@src/adapters/searchResultsStore/removeTagFromSearchResult";

describe("adapters/removeTagFromSearchResult", () => {
  const logger = getLogger();
  const tableName: string = uuid();

  const getSearchResultFn = makeGetSearchResult(client, tableName);
  const putSearchResultsFn = makePutSearchResults(client, tableName);
  const removeTagFromSearchResultsFn = makeRemoveTagFromSearchResult(
    client,
    tableName
  );

  const existingTagId = uuid();
  const nonExistingTagId = uuid();

  beforeEach(async () => {
    await preparesGenericTable(tableName);
  });

  it("successfully removes a tag from existing list", async () => {
    const searchResult = buildSearchResult({ tags: [existingTagId] });

    fromEither(await putSearchResultsFn(logger, [searchResult]));

    const initialState = fromEither(
      await getSearchResultFn(logger, searchResult.id)
    );
    if (initialState === "NOT_FOUND") {
      fail("didn't find searchResult initial state");
    }

    expect(initialState.tags).toEqual([existingTagId]);

    const updatedResult = fromEither(
      await removeTagFromSearchResultsFn(logger, initialState, existingTagId)
    );

    expect(updatedResult.tags).toBeEmpty();
  });

  it("fails when trying to remove tag that doesn't exist", async () => {
    const searchResult = buildSearchResult({ tags: [existingTagId] });

    fromEither(await putSearchResultsFn(logger, [searchResult]));

    const initialState = fromEither(
      await getSearchResultFn(logger, searchResult.id)
    );
    if (initialState === "NOT_FOUND") {
      fail("didn't find searchResult initial state");
    }

    expect(initialState.tags).toEqual([existingTagId]);

    const updatedResultEither = await removeTagFromSearchResultsFn(
      logger,
      initialState,
      nonExistingTagId
    );
    expect(isLeft(updatedResultEither)).toBeTruthy();
  });

  it("fails when trying to remove tag from empty list", async () => {
    const searchResult = buildSearchResult();

    fromEither(await putSearchResultsFn(logger, [searchResult]));

    const initialState = fromEither(
      await getSearchResultFn(logger, searchResult.id)
    );
    if (initialState === "NOT_FOUND") {
      fail("didn't find searchResult initial state");
    }

    expect(initialState.tags).toBeUndefined();

    const updatedResultEither = await removeTagFromSearchResultsFn(
      logger,
      initialState,
      nonExistingTagId
    );
    expect(isLeft(updatedResultEither)).toBeTruthy();
  });
});
