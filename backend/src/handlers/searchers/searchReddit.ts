import { SQSEvent } from "aws-lambda/trigger/sqs";
import {
  getClient as getRedditClient,
  getClientCredentials as getRedditCredentials,
} from "../../adapters/redditSearcher/client";
import { getClient as getSsmClient } from "../../lib/ssm";
import { getLogger } from "../../lib/logger";
import { defaultMiddlewareStack } from "../middlewares/common";
import { makeSearchReddit } from "../../adapters/redditSearcher/searchReddit";
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
