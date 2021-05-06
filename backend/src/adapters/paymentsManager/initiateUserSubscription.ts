import { isLeft, left, right } from "fp-ts/lib/Either";
import { SubscriptionConfig } from "../../domain/models/subscriptionConfig";
import { InitiateUserSubscriptionFn } from "../../domain/ports/paymentsManager/initiateUserSubscription";
import { newPositiveInteger } from "../../lib/iots";
import { JsonObjectEncodable } from "../../lib/models/jsonEncodable";
import { createCustomer, createSubscription } from "../../lib/stripe/client";
import { Client } from "./client";

export const makeInitiateUserSubscription = (
  client: Client,
  subscriptionProductId: string,
  subscriptionConfig: SubscriptionConfig
): InitiateUserSubscriptionFn => {
  return async (logger, userId, userEmail) => {
    const createCustomerEither = await createCustomer(
      { client, logger },
      {
        email: userEmail,
        metadata: { userId },
      }
    );
    if (isLeft(createCustomerEither)) {
      logger.error("createCustomer failed", {
        error: createCustomerEither.left,
      });
      return left("ERROR");
    }
    const customer = createCustomerEither.right;

    logger.info("customer created", {
      customer: (customer as unknown) as JsonObjectEncodable,
    });

    const createSubscriptionEither = await createSubscription(
      { client, logger },
      {
        customer: customer.id,
        items: [
          {
            price: subscriptionProductId,
            quantity: subscriptionConfig.trial.nofSearchWords,
          },
        ],
        trial_period_days: subscriptionConfig.trial.durationInDays,
      }
    );

    if (isLeft(createSubscriptionEither)) {
      logger.error("createSubscription failed", {
        error: createSubscriptionEither.left,
      });
      return left("ERROR");
    }
    const subscription = createSubscriptionEither.right;

    if (subscription.status != "trialing") {
      logger.error("createSubscription didn't create a trial", {
        subscription: (subscription as unknown) as JsonObjectEncodable,
      });
      return left("ERROR");
    }

    logger.info("subscription created", {
      subscription: (subscription as unknown) as JsonObjectEncodable,
    });

    return right({
      userData: {
        subscriptionStatus: "ACTIVE",
        subscriptionType: "TRIAL",
        nofSearchObjects: newPositiveInteger(subscription.items.data.length),
      },
      paymentData: {
        stripe: {
          customerId: customer.id,
          subcriptionId: subscription.id,
        },
      },
    });
  };
};
