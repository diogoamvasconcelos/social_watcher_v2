import { Logger } from "@src/lib/logger";
import { PaymentData } from "@src/domain/models/userItem";
import { DefaultOkReturn } from "@src/domain/ports/shared";

export type PutPaymentDataFn = (
  logger: Logger,
  paymentData: PaymentData
) => DefaultOkReturn;
