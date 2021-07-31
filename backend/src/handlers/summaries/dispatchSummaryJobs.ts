import { getLogger } from "../../lib/logger";
import { defaultMiddlewareStack } from "../middlewares/common";

const logger = getLogger();

const handler = async () => {
  logger.info("hello");

  // get all active keywords, filter if no summaries are required by any user

  // search daily and search weekly (if friday)

  // get users per keyword, check if should send summary

  // dispatch summary jobs
};
export const lambdaHandler = defaultMiddlewareStack(handler);
