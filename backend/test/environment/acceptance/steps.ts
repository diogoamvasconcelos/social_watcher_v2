import {
  decode,
  fromEither,
  newLowerCase,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { uuid } from "@src/lib/uuid";
import { getEnvTestConfig } from "@test/lib/config";
import { getLogger } from "@src/lib/logger";
import {
  adminConfirmSignUp,
  adminDeleteUser,
  getClient as getCognitoClient,
  initiateAuth,
  signUp,
} from "@src/lib/cognito";
import {
  deleteItem,
  getClient as getDynamoDbClient,
  queryItems,
} from "@src/lib/dynamoDb";
import { makeGetUser } from "@src/adapters/userStore/getUser";
import { SubscriptionData, UserId } from "@src/domain/models/user";
import _ from "lodash";
import {
  toUserDataDocumentKeys,
  userItemDocumentCodec,
} from "@src/adapters/userStore/client";
import {
  PaymentData,
  SocialMediaSearchData,
} from "@src/domain/models/userItem";
import {
  getClient as getApiClient,
  updateSearchObject,
  createSearchObject,
} from "@src/lib/apiClient/apiClient";
import { KeywordData } from "@src/domain/models/keyword";
import { makeGetKeywordData } from "@src/adapters/keywordStore/getKeywordData";
import { retryUntil, sleep } from "@test/lib/retry";
import { isLeft, isRight } from "fp-ts/lib/Either";
import { socialMedias } from "@src/domain/models/socialMedia";
import { toDocumentPrimaryKeys } from "@src/adapters/keywordStore/client";
import { AsyncReturnType, PartialDeep } from "type-fest";
import { SearchResult } from "@src/domain/models/searchResult";
import { makePutSearchResults } from "@src/adapters/searchResultsStore/putSearchResults";
import {
  attachPaymentMethod,
  createSubscription,
  deleteCustomer,
  deleteSubscription,
  updateCustomer,
  updateSubscription,
} from "@src/lib/stripe/client";
import { getClient as getPaymentsClient } from "@src/lib/stripe/client";
import { getClient as getSsmClient } from "@src/lib/ssm";
import { getClientCredentials as getPaymentsCredentials } from "@src/adapters/paymentsManager/client";
import { makeGetPaymentData } from "@src/adapters/userStore/getPaymentData";
import Stripe from "stripe";
import { buildSearchResult } from "@test/lib/builders";
import { deepmergeSafe } from "@diogovasconcelos/lib/deepmerge";
import { makeGetResultTagsForUser } from "@src/adapters/userStore/getResultTagsForUser";

const config = getEnvTestConfig();
const logger = getLogger();
const cognitoClient = getCognitoClient();
const dynamoDbClient = getDynamoDbClient();
const apiClient = getApiClient(config.apiEndpoint);

const getKeywordDataFn = makeGetKeywordData(
  dynamoDbClient,
  config.keywordsTableName
);

const putSearchResultsFn = makePutSearchResults(
  dynamoDbClient,
  config.searchResultsTableName
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

  // wait a bit for stripe webhook, before changing subcription, otherwise it gets overriten
  await sleep(5000);

  if (subscriptionData) {
    await updateUserSubscription({
      userId: userSub,
      updatedData: subscriptionData,
    });
  }

  return { id: userSub, email, password };
};
export type TestUser = AsyncReturnType<typeof createTestUser>;

export const deleteUser = async ({
  id,
  email,
}: {
  id: string;
  email: string;
}) => {
  // Delete in cognito
  await adminDeleteUser(
    cognitoClient,
    { UserPoolId: config.cognitoUserPoolId, Username: email },
    logger
  );

  // Delete in stripe
  const paymentData = fromEither(await getPaymentData(id));
  if (paymentData != "NOT_FOUND") {
    const stripeClient = getPaymentsClient(
      await getPaymentsCredentials(getSsmClient(), logger)
    );

    fromEither(
      await deleteCustomer(
        { client: stripeClient, logger },
        paymentData.stripe.customerId
      )
    );
  }

  // Delete in ddb
  const allPartitionItems = fromEither(
    await queryItems(
      dynamoDbClient,
      {
        TableName: config.usersTableName,
        KeyConditionExpression: "#pk = :pk",
        ExpressionAttributeNames: { "#pk": "pk" },
        ExpressionAttributeValues: {
          ":pk": id,
        },
      },
      (item: unknown) => decode(userItemDocumentCodec, item),
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

export const getPaymentData = async (id: string) => {
  return await makeGetPaymentData(dynamoDbClient, config.usersTableName)(
    logger,
    id
  );
};

export const getResultTags = async (id: string) => {
  return await makeGetResultTagsForUser(dynamoDbClient, config.usersTableName)(
    logger,
    id
  );
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
        Key: toUserDataDocumentKeys({ id: userId }),
      })
      .promise()
  ).Item;

  const updatedUserItem = deepmergeSafe(userDataItem ?? {}, {
    subscription: updatedData,
  });

  await dynamoDbClient
    .put({
      TableName: config.usersTableName,
      Item: updatedUserItem,
    })
    .promise();
};

export const createUserSearchObject = async ({
  token,
  keyword,
  twitterStatus,
}: {
  token: string;
  keyword: string;
  twitterStatus: SocialMediaSearchData["enabledStatus"];
}) => {
  return fromEither(
    await createSearchObject(
      {
        client: apiClient,
        token,
      },
      {
        userData: {
          keyword: newLowerCase(keyword),
          searchData: {
            twitter: { enabledStatus: twitterStatus },
          },
        },
      }
    )
  );
};

export const updateUserSearchObject = async ({
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
      },
      {
        index: newPositiveInteger(index),
        userData: {
          keyword: newLowerCase(keyword),
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
      return await getKeywordDataFn(logger, socialMedia, newLowerCase(keyword));
    },
    (res) => {
      logger.info("checkKeyword:getKeywordDataFn attempt", { res });
      if (isLeft(res)) {
        return false;
      }

      if (res.right === "NOT_FOUND") {
        return !exists;
      }

      return res.right.status === expectedStatus;
    }
  );

  expect(isRight(res)).toBeTruthy();
};

export const deleteKeyword = async (keyword: string) => {
  await Promise.all(
    socialMedias.map(async (socialMedia) => {
      return fromEither(
        await deleteItem(
          dynamoDbClient,
          {
            TableName: config.keywordsTableName,
            Key: toDocumentPrimaryKeys({
              keyword: newLowerCase(keyword),
              socialMedia,
            }),
          },
          logger
        )
      );
    })
  );
};

export const addSearchResultDirectly = async (
  partial: PartialDeep<SearchResult>
): Promise<SearchResult> => {
  const searchResult: SearchResult = buildSearchResult(partial);
  fromEither(await putSearchResultsFn(logger, [searchResult]));
  return searchResult;
};

export const updateUserPaymentsSubscription = async (
  paymentData: PaymentData,
  paymentMethod: string,
  params: Stripe.SubscriptionUpdateParams
) => {
  const stripeClient = getPaymentsClient(
    await getPaymentsCredentials(getSsmClient(), logger)
  );

  // Need to add attached payment source or default payment method to be able to update subscription
  const paymentMethodId = fromEither(
    await attachPaymentMethod(
      { client: stripeClient, logger },
      paymentData.stripe.customerId,
      paymentMethod
    )
  );

  fromEither(
    await updateCustomer(
      { client: stripeClient, logger },
      paymentData.stripe.customerId,
      { invoice_settings: { default_payment_method: paymentMethodId } }
    )
  );

  fromEither(
    await updateSubscription(
      {
        client: stripeClient,
        logger,
      },
      paymentData.stripe.subscriptionId,
      params
    )
  );
};

export const deleteTestSubsctiption = async (paymentData: PaymentData) => {
  const stripeClient = getPaymentsClient(
    await getPaymentsCredentials(getSsmClient(), logger)
  );

  fromEither(
    await deleteSubscription(
      { logger, client: stripeClient },
      paymentData.stripe.subscriptionId
    )
  );
};

export const addNewTestSubscription = async (
  paymentData: PaymentData,
  paymentMethod: string
) => {
  const stripeClient = getPaymentsClient(
    await getPaymentsCredentials(getSsmClient(), logger)
  );

  const paymentMethodId = fromEither(
    await attachPaymentMethod(
      { client: stripeClient, logger },
      paymentData.stripe.customerId,
      paymentMethod
    )
  );

  fromEither(
    await createSubscription(
      { logger, client: stripeClient },
      {
        customer: paymentData.stripe.customerId,
        items: [
          {
            price: config.stripeTestProductId,
            quantity: 10,
          },
        ],
        default_payment_method: paymentMethodId,
      }
    )
  );
};
