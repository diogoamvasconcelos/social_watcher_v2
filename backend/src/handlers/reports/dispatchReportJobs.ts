import { getLogger } from "../../lib/logger";
import { defaultMiddlewareStack } from "../middlewares/common";

const logger = getLogger();

const handler = async () => {
  logger.info("hello");

  // get all active keywords, filter if no reports are required by any user

  // search daily and search weekly (if friday) - cap at most recent 10 (SQS size limt, email size limit)

  // get users per keyword, check if should send report

  // dispatch report jobs
};
export const lambdaHandler = defaultMiddlewareStack(handler);
