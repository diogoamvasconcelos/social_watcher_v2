import { Logger } from "@src/lib/logger";
import { UserId } from "@src/domain/models/user";
import { PaymentData } from "@src/domain/models/userItem";
import { CustomRightReturn } from "@src/domain/ports/shared";

export type GetUserIdByCustomerIdFn = (
  logger: Logger,
  customerId: PaymentData["stripe"]["customerId"]
) => CustomRightReturn<UserId>;
