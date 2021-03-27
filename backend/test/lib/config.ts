import { ensure } from "../../src/lib/config";

export const getTestConfig = () => {
  return {
    dynamoDbUrl: ensure("DYNAMODB_URL"),
  };
};
