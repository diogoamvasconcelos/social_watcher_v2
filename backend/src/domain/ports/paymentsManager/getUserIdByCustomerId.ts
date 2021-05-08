import { Logger } from "../../../lib/logger";
import { UserId } from "../../models/user";
import { PaymentData } from "../../models/userItem";
import { CustomRightReturn } from "../shared";

export type GetUserIdByCustomerIdFn = (
  logger: Logger,
  customerId: PaymentData["stripe"]["customerId"]
) => CustomRightReturn<UserId>;
