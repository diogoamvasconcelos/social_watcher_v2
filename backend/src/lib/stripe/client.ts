import { APIGatewayProxyEvent } from "aws-lambda";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import Stripe from "stripe";
import { getClientCredentials } from "../../adapters/paymentsManager/client";
import { getConfig } from "../config";
import { getLogger, Logger } from "../logger";
import { JsonObjectEncodable } from "../models/jsonEncodable";
import { getClient as getSSMClient } from "../ssm";

export const stripeCredentialsCodec = t.type({
  pk: t.string,
  sk: t.string,
  webhookSecret: t.string,
});
export type StripeCredentials = t.TypeOf<typeof stripeCredentialsCodec>;

export const getClient = (credentials: StripeCredentials) => {
  return new Stripe(credentials.sk, {
    apiVersion: "2020-08-27",
  });
};
export type Client = ReturnType<typeof getClient>;

export type StripeDependencies = {
  client: Client;
  logger: Logger;
};

export const verifyWebhookEvent = (
  { client, logger }: StripeDependencies,
  credentials: StripeCredentials,
  event: APIGatewayProxyEvent
): Either<"ERROR", Stripe.Event> => {
  try {
    const stripeEvent = client.webhooks.constructEvent(
      event.body ?? "",
      event.headers["Stripe-Signature"] ?? "",
      credentials.webhookSecret
    );
    return right(stripeEvent);
  } catch (error) {
    logger.error("stripe::verifyWebhookEvent failed", { error });
    return left("ERROR");
  }
};

export const createCustomer = async (
  { client, logger }: StripeDependencies,
  params: Stripe.CustomerCreateParams
): Promise<Either<"ERROR", Stripe.Response<Stripe.Customer>>> => {
  try {
    const newCustomer = await client.customers.create(params);
    return right(newCustomer);
  } catch (error) {
    logger.error("stripe::customers.create failed", { error });
    return left("ERROR");
  }
};

export const createSubscription = async (
  { client, logger }: StripeDependencies,
  params: Stripe.SubscriptionCreateParams
): Promise<Either<"ERROR", Stripe.Response<Stripe.Subscription>>> => {
  try {
    const newSubscription = await client.subscriptions.create(params);
    return right(newSubscription);
  } catch (error) {
    logger.error("stripe::subscriptions.create failed", { error });
    return left("ERROR");
  }
};

export const deleteCustomer = async (
  { client, logger }: StripeDependencies,
  customerId: string
): Promise<Either<"ERROR", "OK">> => {
  try {
    await client.customers.del(customerId);
    return right("OK");
  } catch (error) {
    logger.error("stripe::customers.del failed", { error });
    return left("ERROR");
  }
};

// TEST

export const main = async () => {
  const logger = getLogger();
  const config = getConfig();
  const testCreds: StripeCredentials = await getClientCredentials(
    getSSMClient(),
    logger
  );
  const client = getClient(testCreds);

  const createCustomerEither = await createCustomer(
    { client, logger },
    { email: "deon09+stripetest@gmail.com" }
  );
  if (isLeft(createCustomerEither)) {
    logger.error("createCustomer failed", { error: createCustomerEither.left });
    return;
  }
  const customer = createCustomerEither.right;

  logger.info("customer created", {
    customer: (customer as unknown) as JsonObjectEncodable,
  });

  const createSubscriptionEither = await createSubscription(
    { client, logger },
    {
      customer: customer.id,
      items: [{ price: config.stripeNormalProductId }],
      trial_period_days: 10,
    }
  );

  if (isLeft(createSubscriptionEither)) {
    logger.error("createSubscription failed", {
      error: createSubscriptionEither.left,
    });
    return;
  }
  const subscription = createSubscriptionEither.right;

  logger.info("subscription created", {
    subscription: (subscription as unknown) as JsonObjectEncodable,
  });

  const deleteCustomerEither = await deleteCustomer(
    { client, logger },
    customer.id
  );
  if (isLeft(deleteCustomerEither)) {
    logger.error("deleteCustomer failed", {
      error: deleteCustomerEither.left,
    });
    return;
  }

  logger.info("customer deleted");
};

// void main();

export const responseExample = {
  id: "cus_JQKyqMh0pxrKKZ",
  object: "customer",
  address: null,
  balance: 0,
  created: 1620157952,
  currency: null,
  default_source: null,
  delinquent: false,
  description: null,
  discount: null,
  email: "deon09+stripetest@gmail.com",
  invoice_prefix: "3FACDBD0",
  invoice_settings: {
    custom_fields: null,
    default_payment_method: null,
    footer: null,
  },
  livemode: false,
  metadata: {},
  name: null,
  phone: null,
  preferred_locales: [],
  shipping: null,
  tax_exempt: "none",
};
