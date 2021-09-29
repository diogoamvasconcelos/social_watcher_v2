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
  buildInstagramSearchResult,
  buildRedditSearchResult,
  buildSearchResult,
  buildTwitterSearchResult,
} from "@test/lib/builders";
import { getLocalTestConfig } from "@test/lib/config";
import { getMinutesAgo } from "@src/lib/date";
import { PartialDeep } from "type-fest";

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

  afterEach(async () => {
    fromEither(await deleteIndex({ logger, client }, indexName));
  });

  it("can search using dataQuery", async () => {
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
      ).items
    ).toIncludeAllMembers([searchResultDog, searchResultDogNCat]);

    expect(
      fromEither(
        await searchSearchResultsFn(logger, { keyword, dataQuery: "cat" })
      ).items
    ).toIncludeAllMembers([searchResultCat, searchResultDogNCat]);

    expect(
      fromEither(
        await searchSearchResultsFn(logger, { keyword, dataQuery: "human" })
      ).items
    ).toIncludeAllMembers([searchResultHuman]);

    expect(
      fromEither(
        await searchSearchResultsFn(logger, { keyword, dataQuery: "airplane" })
      ).items
    ).toEqual([]);
  });

  it("can search using timeQuery", async () => {
    const keyword = newLowerCase(uuid());

    const queryStartTime = getMinutesAgo(20);
    const queryEndTime = getMinutesAgo(10);

    const beforeStartSearchResult = buildSearchResult({
      keyword,
      happenedAt: getMinutesAgo(1, new Date(queryStartTime)),
      data: { text: "flower" },
    });
    const beforeEndSearchResult = buildSearchResult({
      keyword,
      happenedAt: getMinutesAgo(1, new Date(queryEndTime)),
      data: { text: "flower" },
    });
    const afterEndSearchResult = buildSearchResult({
      keyword,
      happenedAt: getMinutesAgo(-1, new Date(queryEndTime)),
      data: { text: "flower" },
    });

    await indexSearchResults([
      beforeStartSearchResult,
      beforeEndSearchResult,
      afterEndSearchResult,
    ]);

    expect(
      fromEither(
        await searchSearchResultsFn(logger, {
          keyword,
          timeQuery: { happenedAtStart: queryStartTime },
        })
      ).items
    ).toIncludeAllMembers([beforeEndSearchResult, afterEndSearchResult]);

    expect(
      fromEither(
        await searchSearchResultsFn(logger, {
          keyword,
          timeQuery: { happenedAtEnd: queryEndTime },
        })
      ).items
    ).toIncludeAllMembers([beforeStartSearchResult, beforeEndSearchResult]);

    expect(
      fromEither(
        await searchSearchResultsFn(logger, {
          keyword,
          timeQuery: {
            happenedAtStart: queryStartTime,
            happenedAtEnd: queryEndTime,
          },
        })
      ).items
    ).toIncludeAllMembers([beforeEndSearchResult]);
  });

  it("can search using socialMediaQuery", async () => {
    const keyword = newLowerCase(uuid());

    const goodSearchResult: PartialDeep<SearchResult> = {
      keyword,
      data: { text: "good" },
    };
    const badSearchResult: PartialDeep<SearchResult> = {
      keyword,
      data: { text: "bad" },
    };

    const twitterGoodSearchResult = buildTwitterSearchResult({
      ...goodSearchResult,
      socialMedia: "twitter",
    });
    const twitterBadSearchResult = buildTwitterSearchResult({
      ...badSearchResult,
      socialMedia: "twitter",
    });
    const redditGoodSearchResult = buildRedditSearchResult({
      ...goodSearchResult,
      socialMedia: "reddit",
    });
    const redditBadSearchResult = buildRedditSearchResult({
      ...badSearchResult,
      socialMedia: "reddit",
    });
    const instgramGoodSearchResult = buildInstagramSearchResult({
      ...goodSearchResult,
      socialMedia: "instagram",
    });
    const instagramBadSearchResult = buildInstagramSearchResult({
      ...badSearchResult,
      socialMedia: "instagram",
    });

    await indexSearchResults([
      twitterGoodSearchResult,
      twitterBadSearchResult,
      redditGoodSearchResult,
      redditBadSearchResult,
      instgramGoodSearchResult,
      instagramBadSearchResult,
    ]);

    expect(
      fromEither(
        await searchSearchResultsFn(logger, {
          keyword,
          socialMediaQuery: ["twitter"],
        })
      ).items
    ).toIncludeAllMembers([twitterGoodSearchResult]);

    expect(
      fromEither(
        await searchSearchResultsFn(logger, {
          keyword,
          socialMediaQuery: ["twitter", "reddit"],
        })
      ).items
    ).toIncludeAllMembers([twitterGoodSearchResult, redditGoodSearchResult]);

    expect(
      fromEither(
        await searchSearchResultsFn(logger, {
          keyword,
          socialMediaQuery: ["instagram", "reddit"],
        })
      ).items
    ).toIncludeAllMembers([instgramGoodSearchResult, redditGoodSearchResult]);
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
