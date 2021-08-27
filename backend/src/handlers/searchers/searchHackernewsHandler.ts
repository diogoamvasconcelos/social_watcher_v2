import { SQSEvent } from "aws-lambda/trigger/sqs";
import { makeSearchHackernews } from "@src/adapters/hackernewsSearcher/searchHackernews";
import { getClient as getHackernewsClient } from "@src/adapters/hackernewsSearcher/client";
import { getLogger } from "@src/lib/logger";
import { defaultMiddlewareStack } from "@src/handlers/middlewares/common";
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
