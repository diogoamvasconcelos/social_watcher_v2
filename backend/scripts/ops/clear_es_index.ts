/* 
How to run:
- scripts/with_env.js yarn ts-node scripts/ops/clear_es_index.ts  --env dev
*/

import { isLeft } from "fp-ts/lib/Either";
import {
  createSearchResultIndex,
  getClient,
  getSearchResultIndexName,
} from "@src/adapters/searchResultsSearchEngine/client";
import { getConfig } from "@src/lib/config";
import { deleteIndex, indexExists } from "@src/lib/elasticsearch/client";
import { getLogger } from "@src/lib/logger";

const config = getConfig();
const logger = getLogger();
const client = getClient(config.mainElasticSearchUrl);

export const main = async () => {
  const indexVersion = config.searchResultIndexVersion;
  const indexName = getSearchResultIndexName(indexVersion);

  const existsEither = await indexExists({ logger, client }, indexName);
  if (isLeft(existsEither)) {
    logger.error("Can't clear a non-existing index", {
      index: indexName,
      error: existsEither.left,
    });
    return;
  }

  const deleteEither = await deleteIndex({ logger, client }, indexName);
  if (isLeft(deleteEither)) {
    logger.error("Failed to delete index index", {
      index: indexName,
      error: deleteEither.left,
    });
    return;
  }

  const createEither = await createSearchResultIndex(
    { logger, client },
    indexVersion
  );
  if (isLeft(createEither)) {
    logger.error("Failed to re-create index index", {
      index: indexName,
      error: createEither.left,
    });
    return;
  }

  logger.info("createSearchResultIndex completed", {
    res: createEither.right,
  });
};

// void main();
