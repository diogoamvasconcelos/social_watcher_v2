// TODO
// - add tag to empty
// - append tag to existng tags
// - append duplucated tag

import { client, preparesGenericTable } from "@test/lib/dynamoDb";
import { getLogger } from "@src/lib/logger";
import { uuid } from "@src/lib/uuid";
import { makeGetSearchResult } from "@src/adapters/searchResultsStore/getSearchResult";
import { makePutSearchResults } from "@src/adapters/searchResultsStore/putSearchResults";
import { buildSearchResult } from "@test/lib/builders";
import { makeAddTagToSearchResult } from "@src/adapters/searchResultsStore/addTagToSearchResult";
import { fromEither } from "@diogovasconcelos/lib/iots";

// jest.setTimeout(60000);

describe("adapters/putSearchResults", () => {
  const logger = getLogger();
  const tableName: string = uuid();

  const getSearchResultFn = makeGetSearchResult(client, tableName);
  const putSearchResultsFn = makePutSearchResults(client, tableName);
  const addTagToSearchResultsFn = makeAddTagToSearchResult(client, tableName);

  beforeEach(async () => {
    await preparesGenericTable(tableName);
  });

  it("successfully appends a tag to empty list", async () => {
    const searchResult = buildSearchResult();
    const newTagId = uuid();

    fromEither(await putSearchResultsFn(logger, []));

    const initialState = fromEither(
      await getSearchResultFn(logger, searchResult.id)
    );
    if (initialState === "NOT_FOUND") {
      fail("didn't find searchResult initial state");
    }

    expect(initialState.tags).toBeUndefined;

    // Add tag
    const updatedResult = fromEither(
      await addTagToSearchResultsFn(logger, initialState, newTagId)
    );

    expect(updatedResult.tags).toEqual([newTagId]);
  });
});
