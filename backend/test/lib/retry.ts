import { left, right } from "fp-ts/lib/Either";

export const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retryUntil = async <T>(
  doFn: () => Promise<T>,
  checkFn: (res: unknown) => boolean,
  maxRetries = 5,
  initialDurationMs = 1000,
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

  console.log("retryUntil last failed result:");
  console.log(res);

  return left("RETRY_UNTILL_MAX_RETRIES_REACHED");
};
