import { getClient as getStripeClient } from "@src/lib/stripe/client";
import { Client as SSMClient, getParameter } from "@src/lib/ssm";
import { isLeft } from "fp-ts/lib/Either";
import { Logger } from "@src/lib/logger";
import { stripeCredentialsCodec } from "@src/lib/stripe/models";
import { decode } from "@diogovasconcelos/lib/iots";

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
