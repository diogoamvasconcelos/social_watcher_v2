import {
  dateISOString,
  decode,
  newPositiveInteger,
} from "@diogovasconcelos/lib/iots";
import { isLeft, left, right } from "fp-ts/lib/Either";
import { SubscriptionConfig } from "@src/domain/models/subscriptionConfig";
import { InitiateUserSubscriptionFn } from "@src/domain/ports/paymentsManager/initiateUserSubscription";
import { fromUnix } from "@src/lib/date";
import { createCustomer, createSubscription } from "@src/lib/stripe/client";
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

    logger.info("customer created", { customer });

    const createSubscriptionEither = await createSubscription(
      { client, logger },
      {
        customer: customer.id,
        items: [
          {
            price: subscriptionProductId,
            quantity: subscriptionConfig.trial.nofSearchObjects,
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
        subscription: subscription,
      });
      return left("ERROR");
    }

    logger.info("subscription created", {
      subscription,
    });

    const trialExpiresAtEither = decode(
      dateISOString,
      fromUnix(subscription.trial_end ?? 0)
    );
    if (isLeft(trialExpiresAtEither)) {
      logger.error("createSubscription didn't return 'trail_end'", {
        subscription: subscription,
      });
      return left("ERROR");
    }

    if (!subscription.items.data[0].quantity) {
      logger.error("createSubscription didn't a quantity", {
        subscription: subscription,
      });
      return left("ERROR");
    }

    return right({
      userData: {
        subscription: {
          status: "ACTIVE",
          type: "TRIAL",
          nofSearchObjects: newPositiveInteger(
            subscription.items.data[0].quantity
          ),
          expiresAt: trialExpiresAtEither.right,
        },
      },
      paymentData: {
        stripe: {
          customerId: customer.id,
          subscriptionId: subscription.id,
        },
      },
    });
  };
};
