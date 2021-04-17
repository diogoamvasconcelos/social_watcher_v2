import {
  createSearchResultIndex,
  getClient,
} from "../../../../../src/adapters/searchResultsSearchEngine/client";
import { makeIndexSearchResults } from "../../../../../src/adapters/searchResultsSearchEngine/indexSearchResults";
import { makeSearchSearchResults } from "../../../../../src/adapters/searchResultsSearchEngine/searchSearchResults";
import { SearchResult } from "../../../../../src/domain/models/searchResult";
import {
  deleteIndex,
  refreshIndices,
} from "../../../../../src/lib/elasticsearch/client";
import {
  decode,
  fromEither,
  lowerCase,
  positiveInteger,
} from "../../../../../src/lib/iots";
import { getLogger } from "../../../../../src/lib/logger";
import { uuid } from "../../../../../src/lib/uuid";
import { buildSearchResult } from "../../../../lib/builders";
import { getLocalTestConfig } from "../../../../lib/config";

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
        fromEither(decode(positiveInteger, config.searchResultIndexVersion))
      )
    ).name;
  });

  it("can index searcResults", async () => {
    const keyword = fromEither(decode(lowerCase, uuid()));
    const searchResults: SearchResult[] = [
      buildSearchResult({ keyword }),
      buildSearchResult({ keyword }),
    ];

    const indexResult = fromEither(
      await indexSearchResultsFn(logger, searchResults)
    );

    await refreshIndices(client);
    const searchedResults = fromEither(
      await searchSearchResultsFn(logger, { keyword })
    );

    expect(indexResult).toEqual("OK");
    expect(searchedResults.items).toEqual(searchResults);
  });

  afterEach(async () => {
    fromEither(await deleteIndex({ logger, client }, indexName));
  });
});
