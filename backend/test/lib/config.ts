import { ensure, ensureAndDecode } from "@diogovasconcelos/lib/config";
import { positiveInteger } from "@diogovasconcelos/lib/iots";

export const getLocalTestConfig = () => {
  return {
    dynamoDbUrl: ensure("DYNAMODB_URL"),
    mainElasticSearchUrl: ensure("MAIN_ELASTIC_SEARCH_URL"),
    searchResultIndexVersion: ensureAndDecode(
      "SEARCH_RESULT_INDEX_VERSION",
      positiveInteger
    ),
  };
};

export const getEnvTestConfig = () => {
  return {
    dispatchSearchJobsLambdaName: ensure("DISPATCH_SEARCH_JOBS_LAMBDA_NAME"),
    searchTwitterLambdaName: ensure("SEARCH_TWITTER_LAMBDA_NAME"),
    searchRedditLambdaName: ensure("SEARCH_REDDIT_LAMBDA_NAME"),
    searchHackernewsLambdaName: ensure("SEARCH_HACKERNEWS_LAMBDA_NAME"),
    searchInstagramLambdaName: ensure("SEARCH_INSTAGRAM_LAMBDA_NAME"),
    searchYoutubeLambdaName: ensure("SEARCH_YOUTUBE_LAMBDA_NAME"),
    reportEmailLambdaName: ensure("REPORT_EMAIL_LAMBDA_NAME"),
    cognitoClientId: ensure("COGNITO_CLIENT_ID"),
    cognitoUserPoolId: ensure("COGNITO_USER_POOL_ID"),
    apiEndpoint: ensure("API_ENDPOINT"),
    usersTableName: ensure("USERS_TABLE_NAME"),
    keywordsTableName: ensure("KEYWORDS_TABLE_NAME"),
    searchResultsTableName: ensure("SEARCH_RESULTS_TABLE_NAME"),
    syncSearchResultsToEs: ensure("SYNC_SEARCH_RESULTS_TO_ES_LAMBDA_NAME"),
    mainElasticSearchUrl: ensure("MAIN_ELASTIC_SEARCH_URL"),
    stripeNormalProductId: ensure("STRIPE_PRODUCT_NORMAL_ID"),
  };
};
