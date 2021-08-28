import { SQSEvent } from "aws-lambda/trigger/sqs";
import {
  getClient as getYoutubeClient,
  getClientCredentials as getYoutubeCredentials,
} from "@src/adapters/youtubeSearcher/client";
import { getClient as getSsmClient } from "@src/lib/ssm";
import { getLogger } from "@src/lib/logger";
import { defaultMiddlewareStack } from "@src/handlers/middlewares/common";
import { makeSearchYoutube } from "@src/adapters/youtubeSearcher/searchYoutube";
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
