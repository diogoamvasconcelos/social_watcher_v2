import {
  getClient,
  searchResultToEsDocument,
} from "@src/adapters/searchResultsSearchEngine/client";
import { getConfig } from "@src/lib/config";
import { bulkIndex } from "@src/lib/elasticsearch/client";
import { getLogger } from "@src/lib/logger";
import { buildSearchResult } from "@test/lib/builders";

const config = getConfig();
const logger = getLogger();

export const main = async () => {
  const client = getClient(config.mainElasticSearchUrl);

  const searchResults = [buildSearchResult()];

  const result = await bulkIndex(
    { logger, client },
    {
      indexName: "search_result",
      items: searchResults.map((searchResult) => ({
        id: searchResult.id,
        data: searchResultToEsDocument(searchResult),
      })),
    }
  );

  logger.info("done", { result });
};

//void main();
