import { makeSearchSearchResults } from "../../../../src/adapters/searchResultsSearchEngine/searchSearchResults";
import { decode, fromEither, lowerCase } from "../../../../src/lib/iots";
import { getLogger } from "../../../../src/lib/logger";
import { uuid } from "../../../../src/lib/uuid";
import { buildSearchResultsEvent } from "../../../lib/builders";
import { getEnvTestConfig } from "../../../lib/config";
import { invokeLambda } from "../../../lib/lambda";
import { retryUntil } from "../../../lib/retry";
import { getClient as getSearchResultSearchEngineClient } from "../../../../src/adapters/searchResultsSearchEngine/client";
import { refreshIndices } from "../../../../src/lib/elasticsearch/client";

const config = getEnvTestConfig();
const logger = getLogger();
const client = getSearchResultSearchEngineClient(config.mainElasticSearchUrl);

const lambdaName = config.syncSearchResultsToEs;
const searchSearchResultsFn = makeSearchSearchResults(client);

describe("handlers/syncSearchResultsToEs", () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
  });

  it("syncs multiple search results to es", async () => {
    const keyword = fromEither(decode(lowerCase, uuid()));
    const searchJobEvent = buildSearchResultsEvent(2, { keyword });

    const invokeResult = fromEither(
      await invokeLambda(lambdaName, searchJobEvent)
    );

    expect(invokeResult.StatusCode).toEqual(200);

    const searchedResults = fromEither(
      await retryUntil(
        async () => {
          await refreshIndices(client);
          return fromEither(await searchSearchResultsFn(logger, { keyword }));
        },
        (res) => res.items.length == 2
      )
    );

    expect(searchedResults.items).toHaveLength(2);
    expect(searchedResults.items[0].keyword).toEqual(keyword);
  });
});
