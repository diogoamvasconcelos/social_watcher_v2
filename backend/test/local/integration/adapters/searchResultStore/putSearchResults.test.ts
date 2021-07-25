import { unknownToSearchResult } from "../../../../../src/adapters/searchResultsStore/client";
import { makePutSearchResults } from "../../../../../src/adapters/searchResultsStore/putSearchResults";
import { scanItems } from "../../../../../src/lib/dynamoDb";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { getLogger } from "../../../../../src/lib/logger";
import { uuid } from "../../../../../src/lib/uuid";
import {
  buildHackernewsSearchResult,
  buildInstagramSearchResult,
  buildRedditSearchResult,
  buildTwitterSearchResult,
} from "../../../../lib/builders";
import { client, preparesGenericTable } from "../../../../lib/dynamoDb";
import { sortSearchResults } from "../../../../lib/sort";

describe("adapters/putSearchResults", () => {
  const logger = getLogger();
  const tableName: string = uuid();
  const putSearchResultsFn = makePutSearchResults(client, tableName);

  beforeAll(() => {
    jest.setTimeout(20000);
  });

  beforeEach(async () => {
    await preparesGenericTable(tableName);
  });

  it("converts and stores document correctly", async () => {
    const searchResults = [
      buildTwitterSearchResult(),
      buildRedditSearchResult(),
      buildHackernewsSearchResult(),
      buildInstagramSearchResult(),
    ];

    fromEither(await putSearchResultsFn(logger, searchResults));

    const fetchedSearchResults = fromEither(
      await scanItems(
        client,
        {
          TableName: tableName,
        },
        unknownToSearchResult,
        logger
      )
    );

    expect(sortSearchResults(fetchedSearchResults)).toEqual(
      sortSearchResults(searchResults)
    );
  });
});
