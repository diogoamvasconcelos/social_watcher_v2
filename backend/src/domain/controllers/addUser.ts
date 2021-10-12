import { isLeft, right } from "fp-ts/lib/Either";
import { Logger } from "@src/lib/logger";
import { User, UserId } from "@src/domain/models/user";
import { PaymentData, ResultTag } from "@src/domain/models/userItem";
import { InitiateUserSubscriptionFn } from "@src/domain/ports/paymentsManager/initiateUserSubscription";
import { DefaultOkReturn } from "@src/domain/ports/shared";
import { PutPaymentDataFn } from "@src/domain/ports/userStore/putPaymentData";
import { PutUserFn } from "@src/domain/ports/userStore/putUser";
import { CreateResultTagFn } from "../ports/userStore/createResultTag";
import { uuid } from "@src/lib/uuid";
import { getNow } from "@src/lib/date";

type dependencies = {
  logger: Logger;
  putUserFn: PutUserFn;
  putPaymentDataFn: PutPaymentDataFn;
  initiateUserSubscriptionFn: InitiateUserSubscriptionFn;
  createResultTagFn: CreateResultTagFn;
};

// TODO: maybe change this sequence of operations to a transaction for easier error handling
export const addUser = async (
  {
    logger,
    putUserFn,
    putPaymentDataFn,
    initiateUserSubscriptionFn,
    createResultTagFn,
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

  // Add PaymentData
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

  // Add "favorite" result tag
  const addFavoriteTagResult = await addFavoriteTag(
    logger,
    createResultTagFn,
    data.id
  );
  if (isLeft(addFavoriteTagResult)) {
    return addFavoriteTagResult;
  }

  return right("OK");
};

const addFavoriteTag = async (
  logger: Logger,
  createResultTagFn: CreateResultTagFn,
  userId: UserId
): ReturnType<CreateResultTagFn> => {
  const favoriteTag: ResultTag = {
    type: "RESULT_TAG",
    id: userId,
    tagId: uuid(),
    tagType: "FAVORITE",
    createdAt: getNow(),
  };

  return createResultTagFn(logger, favoriteTag);
};
