import { ensure } from "../../src/lib/config";

export const getLocalTestConfig = () => {
  return {
    dynamoDbUrl: ensure("DYNAMODB_URL"),
  };
};

export const getEnvTestConfig = () => {
  return {
    dispatchSearchJobsLambdaName: ensure("DISPATCH_SEARCH_JOBS_LAMBDA_NAME"),
    searchTwitterLambdaName: ensure("SEARCH_TWITTER_LAMBDA_NAME"),
    cognitoClientId: ensure("COGNITO_CLIENT_ID"),
    cognitoUserPoolId: ensure("COGNITO_USER_POOL_ID"),
    usersTableName: ensure("USERS_TABLE_NAME"),
  };
};
