import { Logger } from "../../../lib/logger";
import { UserId } from "../../models/user";
import { PaymentData } from "../../models/userItem";
import { CustomRightReturn } from "../shared";

export type GetPaymentDataFn = (
  logger: Logger,
  id: UserId
) => CustomRightReturn<PaymentData | "NOT_FOUND">;
