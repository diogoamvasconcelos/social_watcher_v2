import { left, right } from "fp-ts/lib/Either";
import { getLogger } from "@src/lib/logger";
import { JsonObjectEncodable } from "@diogovasconcelos/lib/models/jsonEncodable";

const logger = getLogger();

export const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retryUntil = async <T>(
  doFn: () => Promise<T>,
  checkFn: (res: T) => boolean,
  maxRetries = 5,
  initialDurationMs = 500,
  durationMultFactor = 2
) => {
  let retries = 0;
  let sleepDurationMs = initialDurationMs;
  let res: T = {} as T;

  while (retries++ < maxRetries) {
    res = await doFn();

    if (checkFn(res)) {
      return right(res);
    }

    await sleep(sleepDurationMs);
    sleepDurationMs *= durationMultFactor;
  }

  logger.error("retryUntil last failed result", {
    res: res as unknown as JsonObjectEncodable,
  });

  return left("RETRY_UNTILL_MAX_RETRIES_REACHED");
};
