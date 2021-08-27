import { SQSEvent } from "aws-lambda/trigger/sqs";
import {
  getClient as getRedditClient,
  getClientCredentials as getRedditCredentials,
} from "@src/adapters/redditSearcher/client";
import { getClient as getSsmClient } from "@src/lib/ssm";
import { getLogger } from "@src/lib/logger";
import { defaultMiddlewareStack } from "@src/handlers/middlewares/common";
import { makeSearchReddit } from "@src/adapters/redditSearcher/searchReddit";
import { makeSearcherHandler } from "./shared";

const logger = getLogger();

const handler = async (event: SQSEvent) => {
  const redditCredentials = await getRedditCredentials(getSsmClient(), logger);
  const redditClient = getRedditClient(redditCredentials);
  const searchRedditFn = makeSearchReddit(redditClient);

  return await makeSearcherHandler({
    logger,
    searchSocialMediaFn: searchRedditFn,
  })(event);
};

export const lambdaHandler = defaultMiddlewareStack(handler);
