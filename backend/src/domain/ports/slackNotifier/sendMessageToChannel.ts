import { Logger } from "../../../lib/logger";
import { DefaultOkReturn } from "../shared";

export type SendMessageToChannelFn = (
  logger: Logger,
  channel: string,
  message: string
) => DefaultOkReturn;
