import { SQSEvent } from "aws-lambda/trigger/sqs";
import { makeSearchHackernews } from "../../adapters/hackernewsSearcher/searchHackernews";
import { getClient as getHackernewsClient } from "../../adapters/hackernewsSearcher/client";
import { getLogger } from "../../lib/logger";
import { defaultMiddlewareStack } from "../middlewares/common";
import { makeSearcherHandler } from "./shared";

const logger = getLogger();

const handler = async (event: SQSEvent) => {
  const hackernewsClient = getHackernewsClient();
  const searchHackernewsFn = makeSearchHackernews(hackernewsClient);

  return await makeSearcherHandler({
    logger,
    searchSocialMediaFn: searchHackernewsFn,
  })(event);
};

export const lambdaHandler = defaultMiddlewareStack(handler);
