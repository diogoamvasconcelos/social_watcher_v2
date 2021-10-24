/* 
How to run:
scripts/with_env.js 'yarn ts-node --files -r tsconfig-paths/register scripts/ops/resync_all_search_results_to_es.ts' --env dev
*/

import { unknownToSearchResult } from "@src/adapters/searchResultsStore/client";
import { getConfig } from "@src/lib/config";
import { getLogger } from "@src/lib/logger";
import { ApplyDdbItemBatchFn, applyToAllDdbItems } from "./ops_utils";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { getClient as getSearchResultsQueueClient } from "@src/adapters/searchResultsQueue/client";
import { makeQueueSearchResults } from "@src/adapters/searchResultsQueue/queueSearchJobs";
import { getQueueUrlFromName } from "@src/lib/sqs";
import { QueueSearchResultsFn } from "@src/domain/ports/searchResultsQueue/queueSearchResults";

let queueFn: QueueSearchResultsFn;

const sendSearchObjectsToEsSQSFn: ApplyDdbItemBatchFn = async (
  logger,
  _dynamoDBClient,
  { items }
) => {
  const searchResults = items.map((item) => {
    return fromEither(unknownToSearchResult(item));
  });

  return await queueFn(logger, searchResults);
};

export const main = async () => {
  const config = getConfig();
  const logger = getLogger();

  const searchResultsQueueClient = getSearchResultsQueueClient();
  const queueUrl = fromEither(
    await getQueueUrlFromName(
      searchResultsQueueClient,
      config.syncSearchResultsToEsQueueUrl,
      logger
    )
  );

  queueFn = makeQueueSearchResults(searchResultsQueueClient, queueUrl);

  await applyToAllDdbItems(
    logger,
    config.searchResultsTableName,
    { applyItemBatchFn: sendSearchObjectsToEsSQSFn },
    { throttling: "SOFT" }
  );
};

// void main();
