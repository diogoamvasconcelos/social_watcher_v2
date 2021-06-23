/* 
How to run:
- scripts/with_env.js yarn ts-node scripts/ops/create_es_index.ts  --env de
*/

import { JsonEncodable } from "@diogovasconcelos/lib/models/jsonEncodable";
import {
  getClient,
  createSearchResultIndex,
} from "../../src/adapters/searchResultsSearchEngine/client";
import { getConfig } from "../../src/lib/config";
import { getLogger } from "../../src/lib/logger";

const config = getConfig();
const logger = getLogger();
const client = getClient(config.mainElasticSearchUrl);

const main = async () => {
  const res = await createSearchResultIndex(
    { logger, client },
    config.searchResultIndexVersion
  );
  logger.info("createSearchResultIndex completed", {
    res: res as unknown as JsonEncodable,
  });
};

void main();
