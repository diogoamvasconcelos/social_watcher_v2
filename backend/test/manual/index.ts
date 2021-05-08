import { fromEither, newPositiveInteger } from "../../src/lib/iots";
import { getLogger } from "../../src/lib/logger";
import {
  attachPaymentMethod,
  getClient as getPaymentsClient,
} from "../../src/lib/stripe/client";
import { getClient as getSsmClient } from "../../src/lib/ssm";
import { getClientCredentials as getPaymentsCredentials } from "../../src/adapters/paymentsManager/client";
import {
  updateCustomer,
  updateSubscription,
} from "../../src/lib/stripe/client";
import {
  createTestUser,
  deleteUser,
  getPaymentData,
} from "../environment/acceptance/steps";

const logger = getLogger();

export const manualCreateUser = async () => {
  const user = await createTestUser({
    nofSearchObjects: newPositiveInteger(1),
  });
  logger.info("User created", { user });

  await deleteUser(user);
  logger.info("User Deleted");
};

export const manualStripeTestUser = async () => {
  const stripeClient = getPaymentsClient(
    await getPaymentsCredentials(getSsmClient(), logger)
  );

  const user = await createTestUser({
    nofSearchObjects: newPositiveInteger(1),
  });
  logger.info("User created", { user });

  // const user = {
  //   id: "c9c928e5-4809-4c13-895b-2168632d8598",
  //   email:
  //     "success+9af7dcaf-0812-42e8-b006-41ac7e9631b4@simulator.amazonses.com",
  // };

  const paymentData = fromEither(await getPaymentData(user.id));
  if (paymentData == "NOT_FOUND") {
    throw new Error("Failed to get user PaymentsData");
  }
  logger.info("paymentdata", { paymentData });

  //attach payment method
  logger.info("attaching payment method");
  const paymentdMethodId = fromEither(
    await attachPaymentMethod(
      { client: stripeClient, logger },
      paymentData.stripe.customerId,
      "pm_card_us"
    )
  );

  logger.info("updating customer with default payment method");
  fromEither(
    await updateCustomer(
      { client: stripeClient, logger },
      paymentData.stripe.customerId,
      {
        invoice_settings: {
          default_payment_method: paymentdMethodId,
        },
      }
    )
  );

  logger.info("updating subscription to expire trial");
  fromEither(
    await updateSubscription(
      {
        client: stripeClient,
        logger,
      },
      paymentData.stripe.subscriptionId,
      { trial_end: "now" }
    )
  );

  // await deleteUser(user);
  // logger.info("User Deleted");
};

export const main = async () => {
  //await manualCreateUser();
  await manualStripeTestUser();
};

//void main();
