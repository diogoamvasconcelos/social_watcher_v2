import { DynamoDBStreamEvent } from "aws-lambda";
//import { getConfig } from "../../lib/config";
import { getLogger } from "../../lib/logger";
import { JsonObjectEncodable } from "../../lib/models/jsonEncodable";
import { defaultMiddlewareStack } from "../middlewares/common";

//const config = getConfig();
const logger = getLogger();

const handler = async (event: DynamoDBStreamEvent) => {
  logger.info("got an event", {
    event: (event as unknown) as JsonObjectEncodable,
  });

  // filter by "sk"

  // filter by eventName (INSERT|MODIFY|REMOVE) (lookup at both OLD and NEW)
};

export const lambdaHandler = defaultMiddlewareStack(handler);
