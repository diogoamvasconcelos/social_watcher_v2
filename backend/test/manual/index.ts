import { fromEither, newPositiveInteger } from "@diogovasconcelos/lib";
import { getLogger } from "../../src/lib/logger";
import {
  attachPaymentMethod,
  getClient as getPaymentsClient,
  getCustomerById,
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
import { JsonObjectEncodable } from "@diogovasconcelos/lib";

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

export const getCustomer = async () => {
  const stripeClient = getPaymentsClient(
    await getPaymentsCredentials(getSsmClient(), logger)
  );

  const customer = fromEither(
    await getCustomerById(
      { logger, client: stripeClient },
      "cus_JRFWS7vMXn9b7O"
    )
  );

  logger.info("customer get", {
    customer: customer as unknown as JsonObjectEncodable,
  });

  /*
  const response = {
    id: "cus_JRFWS7vMXn9b7O",
    object: "customer",
    address: null,
    balance: 0,
    created: 1620368348,
    currency: "usd",
    default_source: null,
    delinquent: false,
    description: null,
    discount: null,
    email: "deon09+test-stripe-01@gmail.com",
    invoice_prefix: "942F81AE",
    invoice_settings: {
      custom_fields: null,
      default_payment_method: null,
      footer: null,
    },
    livemode: false,
    metadata: { userId: "667e6c14-0d1e-4cd1-825c-784b38d173f1" },
    name: null,
    phone: null,
    preferred_locales: [],
    shipping: null,
    tax_exempt: "none",
  };
  */
};

export const main = async () => {
  //await manualCreateUser();
  //await manualStripeTestUser();
  await getCustomer();
};

//void main();
