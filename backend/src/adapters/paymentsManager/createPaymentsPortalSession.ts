import { Client } from "./client";
import { CreatePaymentsPortalSessionFn } from "@src/domain/ports/paymentsManager/createPaymentsPortalSession";
import { createBillingPortalSession } from "@src/lib/stripe/client";
import { isLeft, left, right } from "fp-ts/lib/Either";

export const makeCreatePaymentsPortalSession = (
  client: Client
): CreatePaymentsPortalSessionFn => {
  return async (logger, customerId, returnUrl) => {
    const sessionEither = await createBillingPortalSession(
      { logger, client },
      customerId,
      returnUrl
    );
    if (isLeft(sessionEither)) {
      return left("ERROR");
    }
    const session = sessionEither.right;
    return right(session.url);
  };
};
