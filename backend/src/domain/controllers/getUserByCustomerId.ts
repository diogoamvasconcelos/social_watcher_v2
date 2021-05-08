import { Logger } from "../../lib/logger";
import { Either, isLeft, right } from "fp-ts/lib/Either";
import { GetUserIdByCustomerIdFn } from "../ports/paymentsManager/getUserIdByCustomerId";
import { PaymentData } from "../models/userItem";
import { GetUserFn } from "../ports/userStore/getUser";
import { GetPaymentDataFn } from "../ports/userStore/getPaymentData";
import { User } from "../models/user";

export type GetUserByCustomerIdDeps = {
  logger: Logger;
  getUserIdByCustomerIdFn: GetUserIdByCustomerIdFn;
  getUserFn: GetUserFn;
  getPaymentDataFn: GetPaymentDataFn;
};

export const getUserByCustomerId = async (
  {
    logger,
    getUserIdByCustomerIdFn,
    getUserFn,
    getPaymentDataFn,
  }: GetUserByCustomerIdDeps,
  customerId: string
): Promise<
  Either<"ERROR", { user: User; paymentData: PaymentData } | "NOT_FOUND">
> => {
  const userIdEither = await getUserIdByCustomerIdFn(logger, customerId);
  if (isLeft(userIdEither)) {
    return userIdEither;
  }
  const userId = userIdEither.right;

  const userEither = await getUserFn(logger, userId);
  if (isLeft(userEither)) {
    return userEither;
  }
  if (userEither.right === "NOT_FOUND") {
    return right(userEither.right);
  }

  const paymentDataEither = await getPaymentDataFn(logger, userId);
  if (isLeft(paymentDataEither)) {
    return paymentDataEither;
  }
  if (paymentDataEither.right === "NOT_FOUND") {
    return right(paymentDataEither.right);
  }

  return right({
    user: userEither.right,
    paymentData: paymentDataEither.right,
  });
};
