import {
  getClient as getStripeClient,
  stripeCredentialsCodec,
} from "../../lib/stripe/client";
import { Client as SSMClient, getParameter } from "../../lib/ssm";
import { decode } from "@diogovasconcelos/lib";
import { isLeft } from "fp-ts/lib/Either";
import { Logger } from "../../lib/logger";

// This for some reason doesn't work, so use direclty the client from the lib:
// `TypeError: client_2.getClient is not a function`
//export const getClient = getStripeClient;
export type Client = ReturnType<typeof getStripeClient>;

export const getClientCredentials = async (
  ssmClient: SSMClient,
  logger: Logger
) => {
  const result = await getParameter(
    ssmClient,
    { Name: "stripe_keys", WithDecryption: true },
    (value: string) => {
      return decode(stripeCredentialsCodec, JSON.parse(value));
    },
    logger
  );
  if (isLeft(result) || typeof result.right == "string") {
    throw new Error("Failed to retrieve Stripe Credentials");
  }

  return result.right;
};
