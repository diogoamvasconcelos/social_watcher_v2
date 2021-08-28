import { SQSEvent } from "aws-lambda/trigger/sqs";
import { makeSearchTwitter } from "@src/adapters/twitterSearcher/searchTwitter";
import {
  getClient as getTwitterClient,
  getClientCredentials as getTwitterCredentials,
} from "@src/adapters/twitterSearcher/client";
import { getClient as getSsmClient } from "@src/lib/ssm";
import { getLogger } from "@src/lib/logger";
import { defaultMiddlewareStack } from "@src/handlers/middlewares/common";
import { makeSearcherHandler } from "./shared";

const logger = getLogger();

const handler = async (event: SQSEvent) => {
  const twitterCredentials = await getTwitterCredentials(
    getSsmClient(),
    logger
  );
  const twitterClient = getTwitterClient(twitterCredentials);
  const searchTwitterFn = makeSearchTwitter(twitterClient);

  return await makeSearcherHandler({
    logger,
    searchSocialMediaFn: searchTwitterFn,
  })(event);
};

export const lambdaHandler = defaultMiddlewareStack(handler);
