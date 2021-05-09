import { Logger } from "../../../lib/logger";
import { PaymentData } from "../../models/userItem";
import { CustomRightReturn } from "../shared";

export type CreatePaymentsPortalSessionFn = (
  logger: Logger,
  customerId: PaymentData["stripe"]["customerId"],
  returnUrl: string
) => CustomRightReturn<string>;
