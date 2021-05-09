import { Logger } from "../../../lib/logger";
import { User, UserId } from "../../models/user";
import { PaymentData, UserData } from "../../models/userItem";
import { CustomRightReturn } from "../shared";

export type InitiateUserSubscriptionFn = (
  logger: Logger,
  userId: UserId,
  userEmail: User["email"]
) => CustomRightReturn<{
  userData: Pick<UserData, "subscription">;
  paymentData: Pick<PaymentData, "stripe">;
}>;
