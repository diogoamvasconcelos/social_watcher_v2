import {
  Client,
  searchResultIndexAlias,
  searchResultToEsDocument,
} from "./client";
import { IndexSearchResultsFn } from "../../domain/ports/searchResultsSearchEngine/indexSearchResults";
import { bulkIndex } from "../../lib/elasticsearch/client";

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
