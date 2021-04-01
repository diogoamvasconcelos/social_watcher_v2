import AWS from "aws-sdk";
import { Either, left, right } from "fp-ts/lib/Either";
import { Logger } from "./logger";

export const getClient = () => {
  return new AWS.CognitoIdentityServiceProvider();
};
export type Client = ReturnType<typeof getClient>;

export const signUp = async (
  client: Client,
  params: AWS.CognitoIdentityServiceProvider.SignUpRequest,
  logger: Logger
): Promise<Either<"ERROR", string>> => {
  try {
    const result = await client.signUp(params).promise();
    return right(result.UserSub);
  } catch (error) {
    logger.error("cognito signup failed.", { error });
    return left("ERROR");
  }
};

export const adminConfirmSignUp = async (
  client: Client,
  params: AWS.CognitoIdentityServiceProvider.AdminConfirmSignUpRequest,
  logger: Logger
): Promise<Either<"ERROR", "OK">> => {
  try {
    await client.adminConfirmSignUp(params).promise();
    return right("OK");
  } catch (error) {
    logger.error("cognito admin confirm signup failed.", { error });
    return left("ERROR");
  }
};

export const adminDeleteUser = async (
  client: Client,
  params: AWS.CognitoIdentityServiceProvider.AdminDeleteUserRequest,
  logger: Logger
): Promise<Either<"ERROR", "OK">> => {
  try {
    await client.adminDeleteUser(params).promise();
    return right("OK");
  } catch (error) {
    logger.error("cognito admin delete user failed.", { error });
    return left("ERROR");
  }
};
