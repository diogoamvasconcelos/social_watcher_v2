import { makeSearchSearchResults } from "@src/adapters/searchResultsSearchEngine/searchSearchResults";
import { fromEither, newLowerCase } from "@diogovasconcelos/lib/iots";
import { getLogger } from "@src/lib/logger";
import { uuid } from "@src/lib/uuid";
import {
  buildHackernewsSearchResult,
  buildInstagramSearchResult,
  buildRedditSearchResult,
  buildSQSEvent,
  buildTwitterSearchResult,
  buildYoutubeSearchResult,
} from "@test/lib/builders";
import { getEnvTestConfig } from "@test/lib/config";
import { invokeLambda } from "@test/lib/lambda";
import { retryUntil } from "@test/lib/retry";
import { getClient as getSearchResultSearchEngineClient } from "@src/adapters/searchResultsSearchEngine/client";
import { refreshIndices } from "@src/lib/elasticsearch/client";

jest.setTimeout(30000);

const config = getEnvTestConfig();
const logger = getLogger();
const client = getSearchResultSearchEngineClient(config.mainElasticSearchUrl);

const lambdaName = config.syncSearchResultsToEs;
const searchSearchResultsFn = makeSearchSearchResults(client);

describe("handlers/syncSearchResultsToEs", () => {
  it("syncs multiple search results to es", async () => {
    const keyword = newLowerCase(uuid());
    const searchResults = [
      buildTwitterSearchResult({ keyword }),
      buildRedditSearchResult({ keyword }),
      buildHackernewsSearchResult({ keyword }),
      buildInstagramSearchResult({ keyword }),
      buildYoutubeSearchResult({ keyword }),
    ];
    const searchJobEvent = buildSQSEvent(searchResults);

    const invokeResult = fromEither(
      await invokeLambda(lambdaName, searchJobEvent)
    );

    expect(invokeResult.StatusCode).toEqual(200);

    const searchedResults = fromEither(
      await retryUntil(
        async () => {
          await refreshIndices(client);
          return fromEither(
            await searchSearchResultsFn(logger, { keywords: [keyword] })
          );
        },
        (res) => res.items.length == searchResults.length
      )
    );

    expect(searchedResults.items).toHaveLength(searchResults.length);
    expect(searchedResults.items[0].keyword).toEqual(keyword);
  });
});
