import {
  createSearchResultIndex,
  getClient,
} from "../../../../../src/adapters/searchResultsSearchEngine/client";
import { makeIndexSearchResults } from "../../../../../src/adapters/searchResultsSearchEngine/indexSearchResults";
import { SearchResult } from "../../../../../src/domain/models/searchResult";
import { deleteIndex } from "../../../../../src/lib/elasticsearch/client";
import {
  decode,
  fromEither,
  positiveInteger,
} from "../../../../../src/lib/iots";
import { getLogger } from "../../../../../src/lib/logger";
import { buildSearchResult } from "../../../../lib/builders";
import { getLocalTestConfig } from "../../../../lib/config";

const config = getLocalTestConfig();
const logger = getLogger();
const client = getClient(config.mainElasticSearchUrl);

const indexSearchResultsFn = makeIndexSearchResults(client);

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
    const searchResults: SearchResult[] = [
      buildSearchResult(),
      buildSearchResult(),
    ];

    const indexResult = fromEither(
      await indexSearchResultsFn(logger, searchResults)
    );

    const searchResult = fromEither(await searchSearchResultsFn(logger));

    expect(indexResult).toEqual("OK");
  });

  afterEach(async () => {
    fromEither(await deleteIndex(logger, client, indexName));
  });
});
