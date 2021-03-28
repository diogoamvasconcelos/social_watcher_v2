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
  };
};
