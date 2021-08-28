import {
  Client,
  searchResultIndexAlias,
  searchResultToEsDocument,
} from "./client";
import { IndexSearchResultsFn } from "@src/domain/ports/searchResultsSearchEngine/indexSearchResults";
import { bulkIndex } from "@src/lib/elasticsearch/client";

export const makeIndexSearchResults = (
  client: Client
): IndexSearchResultsFn => {
  return async (logger, searchResults) => {
    return await bulkIndex(
      { logger, client },
      {
        indexName: searchResultIndexAlias,
        items: searchResults.map((searchResult) => ({
          id: searchResult.id,
          data: searchResultToEsDocument(searchResult),
        })),
      }
    );
  };
};
