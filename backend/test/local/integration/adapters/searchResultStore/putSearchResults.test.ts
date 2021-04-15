import _ from "lodash";
import { unknownToSearchResult } from "../../../../../src/adapters/searchResultsStore/client";
import { makePutSearchResults } from "../../../../../src/adapters/searchResultsStore/putSearchResults";
import { scanItems } from "../../../../../src/lib/dynamoDb";
import { fromEither } from "../../../../../src/lib/iots";
import { getLogger } from "../../../../../src/lib/logger";
import { uuid } from "../../../../../src/lib/uuid";
import { buildSearchResult } from "../../../../lib/builders";
import { client, preparesGenericTable } from "../../../../lib/dynamoDb";

describe("adapters/putSearchResults", () => {
  const logger = getLogger();
  const tableName: string = uuid();
  const putSearchResultsFn = makePutSearchResults(client, tableName);

  beforeEach(async () => {
    await preparesGenericTable(tableName);
  });

  it("converts and stores document correctly", async () => {
    const searchResults = [buildSearchResult(), buildSearchResult()];

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

    expect(_.sortBy(fetchedSearchResults, (item) => item.id)).toEqual(
      _.sortBy(searchResults, (item) => item.id)
    );
  });
});
