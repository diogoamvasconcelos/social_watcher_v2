import "jest-extended";
import {
  createSearchResultIndex,
  getClient,
} from "@src/adapters/searchResultsSearchEngine/client";
import { makeIndexSearchResults } from "@src/adapters/searchResultsSearchEngine/indexSearchResults";
import { makeSearchSearchResults } from "@src/adapters/searchResultsSearchEngine/searchSearchResults";
import { SearchResult } from "@src/domain/models/searchResult";
import { deleteIndex, refreshIndices } from "@src/lib/elasticsearch/client";
import {
  fromEither,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { getLogger } from "@src/lib/logger";
import { uuid } from "@src/lib/uuid";
import {
  buildRedditSearchResult,
  buildTwitterSearchResult,
  buildHackernewsSearchResult,
  buildInstagramSearchResult,
  buildYoutubeSearchResult,
} from "@test/lib/builders";
import { getLocalTestConfig } from "@test/lib/config";

jest.setTimeout(10000);

const config = getLocalTestConfig();
const logger = getLogger();
const client = getClient(config.mainElasticSearchUrl);

const indexSearchResultsFn = makeIndexSearchResults(client);
const searchSearchResultsFn = makeSearchSearchResults(client);

let indexName: string;

describe("indexSearchResults", () => {
  beforeEach(async () => {
    indexName = fromEither(
      await createSearchResultIndex(
        { logger, client },
        newPositiveInteger(config.searchResultIndexVersion)
      )
    ).name;
  });

  it("can index searchResults", async () => {
    const keyword = newLowerCase(uuid());
    const searchResults: SearchResult[] = [
      buildTwitterSearchResult({ keyword }),
      buildRedditSearchResult({ keyword }),
      buildHackernewsSearchResult({ keyword }),
      buildInstagramSearchResult({ keyword }),
      buildYoutubeSearchResult({ keyword }),
    ];

    const indexResult = fromEither(
      await indexSearchResultsFn(logger, searchResults)
    );

    await refreshIndices(client);
    const searchedResults = fromEither(
      await searchSearchResultsFn(logger, { keyword })
    );

    expect(indexResult).toEqual("OK");
    expect(searchedResults.items).toIncludeAllMembers(searchResults);
  });

  afterEach(async () => {
    fromEither(await deleteIndex({ logger, client }, indexName));
  });
});
