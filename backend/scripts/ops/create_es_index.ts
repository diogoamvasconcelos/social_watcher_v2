/* 
How to run:
- scripts/with_env.js 'yarn ts-node --files -r tsconfig-paths/register scripts/ops/create_es_index.ts' --env dev
*/

import {
  getClient,
  createSearchResultIndex,
} from "@src/adapters/searchResultsSearchEngine/client";
import { getConfig } from "@src/lib/config";
import { getLogger } from "@src/lib/logger";

const config = getConfig();
const logger = getLogger();
const client = getClient(config.mainElasticSearchUrl);

export const main = async () => {
  const res = await createSearchResultIndex(
    { logger, client },
    config.searchResultIndexVersion
  );
  logger.info("createSearchResultIndex completed", { res });
};

//void main();
