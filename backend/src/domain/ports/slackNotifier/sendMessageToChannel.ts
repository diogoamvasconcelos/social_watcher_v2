import { Logger } from "@src/lib/logger";
import { DefaultOkReturn } from "@src/domain/ports/shared";

export type SendMessageToChannelFn = (
  logger: Logger,
  channel: string,
  message: string
) => DefaultOkReturn;
