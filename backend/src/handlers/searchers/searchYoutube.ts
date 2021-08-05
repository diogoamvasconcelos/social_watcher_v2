import { SQSEvent } from "aws-lambda/trigger/sqs";
import {
  getClient as getYoutubeClient,
  getClientCredentials as getYoutubeCredentials,
} from "../../adapters/youtubeSearcher/client";
import { getClient as getSsmClient } from "../../lib/ssm";
import { getLogger } from "../../lib/logger";
import { defaultMiddlewareStack } from "../middlewares/common";
import { makeSearchYoutube } from "../../adapters/youtubeSearcher/searchYoutube";
import { makeSearcherHandler } from "./shared";

const logger = getLogger();

const handler = async (event: SQSEvent) => {
  const youtubeCredentials = await getYoutubeCredentials(
    getSsmClient(),
    logger
  );
  const youtubeClient = getYoutubeClient(youtubeCredentials);
  const searchYoutubeFn = makeSearchYoutube(youtubeClient);

  return await makeSearcherHandler({
    logger,
    searchSocialMediaFn: searchYoutubeFn,
  })(event);
};

export const lambdaHandler = defaultMiddlewareStack(handler);
