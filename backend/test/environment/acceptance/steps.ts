import {
  decode,
  fromEither,
  lowerCase,
  positiveInteger,
} from "../../../src/lib/iots";
import { uuid } from "../../../src/lib/uuid";
import { getEnvTestConfig } from "../../lib/config";
import { getLogger } from "../../../src/lib/logger";
import {
  adminConfirmSignUp,
  adminDeleteUser,
  getClient as getCognitoClient,
  initiateAuth,
  signUp,
} from "../../../src/lib/cognito";
import {
  deleteItem,
  getClient as getDynamoDbClient,
  queryItems,
} from "../../../src/lib/dynamoDb";
import { makeGetUser } from "../../../src/adapters/userStore/getUser";
import { SubscriptionData, UserId } from "../../../src/domain/models/user";
import deepmerge from "deepmerge";
import _ from "lodash";
import {
  toUserDataDocKeys,
  unknownToUserItem,
} from "../../../src/adapters/userStore/client";
import { SocialMediaSearchData } from "../../../src/domain/models/userItem";
import {
  getClient as getApiClient,
  updateSearchObject,
} from "../../../src/lib/apiClient/apiClient";
import { KeywordData } from "../../../src/domain/models/keyword";
import { makeGetKeywordData } from "../../../src/adapters/keywordStore/getKeywordData";
import { retryUntil } from "../../lib/retry";
import { isLeft, isRight } from "fp-ts/lib/Either";

const config = getEnvTestConfig();
const logger = getLogger();
const cognitoClient = getCognitoClient();
const dynamoDbClient = getDynamoDbClient();
const apiClient = getApiClient(config.apiEndpoint);

const getKeywordDataFn = makeGetKeywordData(
  dynamoDbClient,
  config.usersTableName
);

export const createTestUser = async (
  subscriptionData?: Partial<SubscriptionData>
) => {
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

  if (subscriptionData) {
    await updateUserSubscription({
      userId: userSub,
      updatedData: subscriptionData,
    });
  }

  return { id: userSub, email, password };
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

  const allPartitionItems = fromEither(
    await queryItems(
      dynamoDbClient,
      {
        TableName: config.usersTableName,
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: {
          ":pk": id,
        },
      },
      unknownToUserItem,
      logger
    )
  );

  await Promise.all(
    allPartitionItems.map(async (doc) => {
      return await deleteItem(
        dynamoDbClient,
        {
          TableName: config.usersTableName,
          Key: _.pick(doc, ["pk", "sk"]),
        },
        logger
      );
    })
  );
};

export const getUser = async (id: string) => {
  return await makeGetUser(dynamoDbClient, config.usersTableName)(logger, id);
};

export const getIdToken = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const tokens = fromEither(
    await initiateAuth(
      cognitoClient,
      {
        ClientId: config.cognitoClientId,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      },
      logger
    )
  );

  if (!tokens.IdToken) {
    return "Failed to get id token";
  }

  return tokens.IdToken;
};

export const updateUserSubscription = async ({
  userId,
  updatedData,
}: {
  userId: UserId;
  updatedData: Partial<SubscriptionData>;
}) => {
  const userDataItem = (
    await dynamoDbClient
      .get({
        TableName: config.usersTableName,
        Key: toUserDataDocKeys({ id: userId }),
      })
      .promise()
  ).Item;

  const updatedUserItem = deepmerge(userDataItem ?? {}, updatedData);

  await dynamoDbClient
    .put({
      TableName: config.usersTableName,
      Item: updatedUserItem,
    })
    .promise();
};

export const updateKeyword = async ({
  token,
  keyword,
  index,
  twitterStatus,
}: {
  token: string;
  keyword: string;
  index: number;
  twitterStatus: SocialMediaSearchData["enabledStatus"];
}) => {
  return fromEither(
    await updateSearchObject(
      {
        client: apiClient,
        token,
        logger,
      },
      {
        index: fromEither(decode(positiveInteger, index)),
        userData: {
          keyword: fromEither(decode(lowerCase, keyword)),
          searchData: {
            twitter: { enabledStatus: twitterStatus },
          },
        },
      }
    )
  );
};

export const checkKeyword = async ({
  keyword,
  socialMedia,
  status: expectedStatus,
  exists,
}: Omit<KeywordData, "keyword"> & { keyword: string; exists: boolean }) => {
  const res = await retryUntil(
    async () => {
      return await getKeywordDataFn(
        logger,
        socialMedia,
        fromEither(decode(lowerCase, keyword))
      );
    },
    (res) => {
      if (isLeft(res)) {
        return false;
      }

      if (res.right === "NOT_FOUND") {
        return !exists;
      }

      return res.right.status === expectedStatus;
    }
  );

  expect(isRight(res)).toBeTrue;
};
