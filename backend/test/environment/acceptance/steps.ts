import { fromEither } from "../../../src/lib/iots";
import { uuid } from "../../../src/lib/uuid";
import { getEnvTestConfig } from "../../lib/config";
import { getLogger } from "../../../src/lib/logger";
import {
  adminConfirmSignUp,
  adminDeleteUser,
  getClient as getCognitoClient,
  signUp,
} from "../../../src/lib/cognito";
import {
  deleteItem,
  getClient as getDynamoDbClient,
} from "../../../src/lib/dynamoDb";
import { toUserDocKeys } from "../../../src/adapters/userStore/client";
import { makeGetUser } from "../../../src/adapters/userStore/getUser";

const config = getEnvTestConfig();
const logger = getLogger();
const cognitoClient = getCognitoClient();
const dynamoDbClient = getDynamoDbClient();

export const createTestUser = async () => {
  // Test emails should look like "success+whatevs@simulator.amazonses.com"; see
  // https://docs.aws.amazon.com/cognito/latest/developerguide/signing-up-users-in-your-app.html#managing-users-accounts-email-testing
  const email = `success+${uuid()}@simulator.amazonses.com`;
  const password = uuid();

  const userSub = fromEither(
    await signUp(
      cognitoClient,
      {
        ClientId: config.cognitoClientId,
        Username: email,
        Password: password,
      },
      logger
    )
  );

  fromEither(
    await adminConfirmSignUp(
      cognitoClient,
      {
        UserPoolId: config.cognitoUserPoolId,
        Username: email,
      },
      logger
    )
  );

  return { id: userSub, email };
};

export const deleteUser = async ({
  id,
  email,
}: {
  id: string;
  email: string;
}) => {
  fromEither(
    await adminDeleteUser(
      cognitoClient,
      { UserPoolId: config.cognitoUserPoolId, Username: email },
      logger
    )
  );

  fromEither(
    await deleteItem(
      dynamoDbClient,
      {
        TableName: config.usersTableName,
        Key: toUserDocKeys({ id }),
      },
      logger
    )
  );
};

export const getUser = async (id: string) => {
  return await makeGetUser(dynamoDbClient, config.usersTableName)(logger, id);
};
