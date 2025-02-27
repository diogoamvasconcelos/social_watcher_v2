import { isLeft, left, right } from "fp-ts/lib/Either";
import { GetUserIdByCustomerIdFn } from "@src/domain/ports/paymentsManager/getUserIdByCustomerId";
import { getCustomerById } from "@src/lib/stripe/client";
import { Client } from "./client";

export const makeGetUserIdByCustomerId = (
  client: Client
): GetUserIdByCustomerIdFn => {
  return async (logger, customerId) => {
    const customerEither = await getCustomerById(
      { logger, client },
      customerId
    );
    if (isLeft(customerEither)) {
      return left("ERROR");
    }
    const customer = customerEither.right;

    const userId = customer.metadata.userId;
    if (!userId) {
      logger.error("couldn't find userId in metadata", { customer });
    }

    return right(userId);
  };
};
