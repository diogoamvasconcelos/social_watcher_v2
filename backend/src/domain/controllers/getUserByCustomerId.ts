import { Logger } from "@src/lib/logger";
import { isLeft, right } from "fp-ts/lib/Either";
import { GetUserIdByCustomerIdFn } from "@src/domain/ports/paymentsManager/getUserIdByCustomerId";
import { PaymentData } from "@src/domain/models/userItem";
import { GetUserFn } from "@src/domain/ports/userStore/getUser";
import { GetPaymentDataFn } from "@src/domain/ports/userStore/getPaymentData";
import { User } from "@src/domain/models/user";
import { CustomRightReturn } from "@src/domain/ports/shared";

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
): CustomRightReturn<
  { user: User; paymentData: PaymentData } | "NOT_FOUND"
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
    return right("NOT_FOUND");
  }

  const paymentDataEither = await getPaymentDataFn(logger, userId);
  if (isLeft(paymentDataEither)) {
    return paymentDataEither;
  }
  if (paymentDataEither.right === "NOT_FOUND") {
    return right("NOT_FOUND");
  }

  return right({
    user: userEither.right,
    paymentData: paymentDataEither.right,
  });
};
