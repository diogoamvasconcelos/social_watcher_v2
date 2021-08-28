import { Logger } from "@src/lib/logger";
import { User, UserId } from "@src/domain/models/user";
import { PaymentData, UserData } from "@src/domain/models/userItem";
import { CustomRightReturn } from "@src/domain/ports/shared";

export type InitiateUserSubscriptionFn = (
  logger: Logger,
  userId: UserId,
  userEmail: User["email"]
) => CustomRightReturn<{
  userData: Pick<UserData, "subscription">;
  paymentData: Pick<PaymentData, "stripe">;
}>;
