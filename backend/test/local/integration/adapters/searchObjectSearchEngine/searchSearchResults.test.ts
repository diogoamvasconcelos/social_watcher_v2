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
  fromEither,
  newLowerCase,
  newPositiveInteger,
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
  beforeAll(() => {
    jest.setTimeout(10000);
  });

  beforeEach(async () => {
    indexName = fromEither(
      await createSearchResultIndex(
        { logger, client },
        newPositiveInteger(config.searchResultIndexVersion)
      )
    ).name;
  });

  it("can search using QueryData", async () => {
    const keyword = newLowerCase(uuid());
    const otherKeyword = newLowerCase(uuid());

    const searchResultDog = buildSearchResult({
      keyword,
      data: { text: "such a nice dog" },
    });
    const searchResultDogOtherK = buildSearchResult({
      keyword: otherKeyword,
      data: searchResultDog.data,
    });
    const searchResultCat = buildSearchResult({
      keyword,
      data: { text: "what a mean cat" },
    });
    const searchResultDogNCat = buildSearchResult({
      keyword,
      data: { translatedText: "a bad dog, and a nice cat" },
    });
    const searchResultHuman = buildSearchResult({
      keyword,
      data: { text: "human" },
    });

    await indexSearchResults([
      searchResultDog,
      searchResultDogOtherK,
      searchResultCat,
      searchResultDogNCat,
      searchResultHuman,
    ]);

    expect(
      fromEither(await searchSearchResultsFn(logger, { keyword })).items.sort
    ).toEqual(
      [
        searchResultDog,
        searchResultDogOtherK,
        searchResultCat,
        searchResultDogNCat,
        searchResultHuman,
      ].sort
    );

    expect(
      fromEither(
        await searchSearchResultsFn(logger, { keyword, dataQuery: "dog" })
      ).items.sort
    ).toEqual([searchResultDog, searchResultDogNCat].sort);

    expect(
      fromEither(
        await searchSearchResultsFn(logger, { keyword, dataQuery: "cat" })
      ).items.sort
    ).toEqual([searchResultCat, searchResultDogNCat].sort);

    expect(
      fromEither(
        await searchSearchResultsFn(logger, { keyword, dataQuery: "human" })
      ).items.sort
    ).toEqual([searchResultHuman].sort);

    expect(
      fromEither(
        await searchSearchResultsFn(logger, { keyword, dataQuery: "airplane" })
      ).items
    ).toEqual([]);
  });

  afterEach(async () => {
    fromEither(await deleteIndex({ logger, client }, indexName));
  });
});

const indexSearchResults = async (
  params: Parameters<typeof buildSearchResult>[0][]
) => {
  const searchResults: SearchResult[] = params.map((param) =>
    buildSearchResult(param)
  );

  fromEither(await indexSearchResultsFn(logger, searchResults));
  await refreshIndices(client);
};
