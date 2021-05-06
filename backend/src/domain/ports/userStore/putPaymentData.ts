import { Logger } from "../../../lib/logger";
import { PaymentData } from "../../models/userItem";
import { DefaultOkReturn } from "../shared";

export type PutPaymentDataFn = (
  logger: Logger,
  paymentData: PaymentData
) => DefaultOkReturn;
