import { isLeft, right } from "fp-ts/lib/Either";
import { Logger } from "../../lib/logger";
import { User, UserId } from "../models/user";
import { PaymentData } from "../models/userItem";
import { InitiateUserSubscriptionFn } from "../ports/paymentsManager/initiateUserSubscription";
import { DefaultOkReturn } from "../ports/shared";
import { PutPaymentDataFn } from "../ports/userStore/putPaymentData";
import { PutUserFn } from "../ports/userStore/putUser";

type dependencies = {
  logger: Logger;
  putUserFn: PutUserFn;
  putPaymentDataFn: PutPaymentDataFn;
  initiateUserSubscriptionFn: InitiateUserSubscriptionFn;
};

export const addUser = async (
  {
    logger,
    putUserFn,
    putPaymentDataFn,
    initiateUserSubscriptionFn,
  }: dependencies,
  data: { email: User["email"]; id: UserId }
): DefaultOkReturn => {
  const userSubscriptionEither = await initiateUserSubscriptionFn(
    logger,
    data.id,
    data.email
  );
  if (isLeft(userSubscriptionEither)) {
    return userSubscriptionEither;
  }
  const userSubscription = userSubscriptionEither.right;

  const user: User = {
    ...data,
    ...userSubscription.userData,
  };
  logger.info("Storing new user", { user });

  const putUserEither = await putUserFn(logger, user);
  if (isLeft(putUserEither)) {
    return putUserEither;
  }

  const paymentData: PaymentData = {
    ...userSubscription.paymentData,
    type: "PAYMENT_DATA",
    id: data.id,
  };
  logger.info("Storing payment data", { paymentData });
  const putPaymentDataEither = await putPaymentDataFn(logger, paymentData);
  if (isLeft(putPaymentDataEither)) {
    return putPaymentDataEither;
  }

  return right("OK");
};
