import { Logger } from "@src/lib/logger";
import { PaymentData } from "@src/domain/models/userItem";
import { CustomRightReturn } from "@src/domain/ports/shared";

export type CreatePaymentsPortalSessionFn = (
  logger: Logger,
  customerId: PaymentData["stripe"]["customerId"],
  returnUrl: string
) => CustomRightReturn<string>;
