/*
how to run:
yarn with-local-stack 'jest --testMatch "<rootDir>scripts/ops/patches/add_hackernews_fuzzymatch.test.ts"'
*/

import { client, preparesGenericTable } from "@test/lib/dynamoDb";
import { uuid } from "@src/lib/uuid";
import { buildHackernewsSearchResult } from "@test/lib/builders";
import { main } from "./add_hackernews_fuzzymatch";
import { makeGetSearchResult } from "@src/adapters/searchResultsStore/getSearchResult";
import { getLogger } from "@src/lib/logger";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { makePutSearchResults } from "@src/adapters/searchResultsStore/putSearchResults";
import { getConfig } from "@src/lib/config";
import { SearchResult } from "@src/domain/models/searchResult";
import { sleep } from "@test/lib/retry";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";

const logger = getLogger();

jest.setTimeout(20000);

jest.mock("@src/lib/config");
const getConfigMock = getConfig as jest.MockedFunction<typeof getConfig>;

describe("ops/add_hackernews_fuzzymatch", () => {
  const tableName: string = uuid();
  const getSearchResultFn = makeGetSearchResult(client, tableName);
  const putSearchResultsFn = makePutSearchResults(client, tableName);

  getConfigMock.mockReturnValue({
    ...getConfig(),
    searchResultsTableName: tableName,
  });

  beforeEach(async () => {
    await preparesGenericTable(tableName);
  });

  it("patches old but not a new hackernews result", async () => {
    const oldSearchResult = buildHackernewsSearchResult();
    // @ts-expect-error
    oldSearchResult.data.fuzzyMatch = undefined;
    const newSearchResult = buildHackernewsSearchResult();

    fromEither(
      await putSearchResultsFn(logger, [
        oldSearchResult as unknown as SearchResult,
        newSearchResult,
      ])
    );

    expect(async () => await main()).not.toThrow();

    // wait to make sure that the "weak" consistent gets, retrive the latest results
    await sleep(5000);

    const patchedOldSearchResult = fromEither(
      await getSearchResultFn(logger, oldSearchResult.id)
    );
    const patchedNewSearchResult = fromEither(
      await getSearchResultFn(logger, newSearchResult.id)
    );

    expect(patchedOldSearchResult).toEqual(
      deepmergeSafe(oldSearchResult, { data: { fuzzyMatch: true } })
    );
    expect(patchedNewSearchResult).toEqual(patchedNewSearchResult);
  });
});
