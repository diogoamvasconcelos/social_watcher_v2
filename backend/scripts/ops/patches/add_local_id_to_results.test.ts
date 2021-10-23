// how to run:
// yarn with-local-stack 'jest --testMatch "<rootDir>scripts/ops/patches/add_local_id_to_results.test.ts"'

import { client, preparesGenericTable } from "@test/lib/dynamoDb";
import { uuid } from "@src/lib/uuid";
import { buildSearchResult } from "@test/lib/builders";
import _ from "lodash";
import { main } from "./add_local_id_to_results";
import { makeGetSearchResult } from "@src/adapters/searchResultsStore/getSearchResult";
import { getLogger } from "@src/lib/logger";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { makePutSearchResults } from "@src/adapters/searchResultsStore/putSearchResults";
import { getConfig } from "@src/lib/config";
import { SearchResult, toUniqueId } from "@src/domain/models/searchResult";
import { sleep } from "@test/lib/retry";

const logger = getLogger();

jest.setTimeout(20000);

jest.mock("@src/lib/config");
const getConfigMock = getConfig as jest.MockedFunction<typeof getConfig>;

describe("ops/add_local_id_to_results", () => {
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

  it("patches old but not a new searchResult", async () => {
    const oldSearchResult = {
      ..._.omit(buildSearchResult(), ["localId", "id"]),
      id: uuid(),
    };
    const newSearchResult = buildSearchResult();

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

    expect(patchedOldSearchResult).toEqual({
      ...oldSearchResult,
      localId: oldSearchResult.id,
      id: toUniqueId({
        socialMedia: oldSearchResult.socialMedia,
        localId: oldSearchResult.id,
      }),
    });
    expect(patchedNewSearchResult).toEqual(patchedNewSearchResult);
  });
});
