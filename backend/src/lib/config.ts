import { positiveInteger } from "@diogovasconcelos/lib";
import { ensure, ensureAndDecode } from "@diogovasconcelos/lib";

export const getConfig = () => {
  return {
    env: ensure("ENV"),
    usersTableName: ensure("USERS_TABLE_NAME"),
    keywordsTableName: ensure("KEYWORDS_TABLE_NAME"),
    searchResultsTableName: ensure("SEARCH_RESULTS_TABLE_NAME"),
    searchJobsQueueTemplateName: ensure("SEARCH_JOBS_QUEUE_TEMPLATE_NAME"),
    mainElasticSearchUrl: ensure("MAIN_ELASTIC_SEARCH_URL"),
    searchResultIndexVersion: ensureAndDecode(
      "SEARCH_RESULT_INDEX_VERSION",
      positiveInteger
    ),
    syncSearchResultsToEsQueueUrl: ensure(
      "SYNC_SEARCH_RESULTS_TO_ES_QUEUE_URL"
    ),
    stripeNormalProductId: ensure("STRIPE_PRODUCT_NORMAL_ID"),
    searchResultsNotificationsQueueUrl: ensure(
      "SEARCH_RESULTS_NOTIFICATIONS_QUEUE_URL"
    ),
    notificationJosbQueueTemplateName: ensure(
      "NOTIFICATION_JOBS_QUEUE_TEMPLATE_NAME"
    ),
  };
};
export type Config = ReturnType<typeof getConfig>;

export const getSecret = (secretName: string): string => {
  return ensure(secretName);
};
