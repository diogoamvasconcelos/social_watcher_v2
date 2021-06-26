import { SQSEvent } from "aws-lambda";
import { makeSearchTwitter } from "../../adapters/twitterSearcher/searchTwitter";
import {
  getClient as getTwitterClient,
  getClientCredentials as getTwitterCredentials,
} from "../../adapters/twitterSearcher/client";
import { getClient as getSsmClient } from "../../lib/ssm";
import { getLogger } from "../../lib/logger";
import { defaultMiddlewareStack } from "../middlewares/common";
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
