import { APIGatewayProxyEvent } from "aws-lambda";
import { Either, left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import Stripe from "stripe";
import { Logger } from "../logger";

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

export const updateSubscription = async (
  { client, logger }: StripeDependencies,
  subscriptionId: string,
  params: Stripe.SubscriptionUpdateParams
): Promise<Either<"ERROR", Stripe.Response<Stripe.Subscription>>> => {
  try {
    const newSubscription = await client.subscriptions.update(
      subscriptionId,
      params
    );
    return right(newSubscription);
  } catch (error) {
    logger.error("stripe::subscriptions.update failed", { error });
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

export const updateCustomer = async (
  { client, logger }: StripeDependencies,
  customerId: string,
  params: Stripe.CustomerUpdateParams
): Promise<Either<"ERROR", "OK">> => {
  try {
    await client.customers.update(customerId, params);
    return right("OK");
  } catch (error) {
    logger.error("stripe::customer.update failed", { error });
    return left("ERROR");
  }
};

export const attachPaymentMethod = async (
  { client, logger }: StripeDependencies,
  customerId: string,
  paymentMethod: string
): Promise<Either<"ERROR", string>> => {
  try {
    const res = await client.paymentMethods.attach(paymentMethod, {
      customer: customerId,
    });
    return right(res.id);
  } catch (error) {
    logger.error("stripe::paymentMethods.attach failed", { error });
    return left("ERROR");
  }
};
