import { SQSEvent } from "aws-lambda/trigger/sqs";
import { getClient as getSsmClient } from "@src/lib/ssm";
import { getLogger } from "@src/lib/logger";
import { defaultMiddlewareStack } from "@src/handlers/middlewares/common";
import { makeSearcherHandler } from "./shared";
import { makeSearchInstagram } from "@src/adapters/instagramSearcher/searchInstagram";
import { isLeft } from "fp-ts/lib/Either";
import {
  getClient as getInstagramClient,
  getClientAPIKey,
} from "@src/adapters/instagramSearcher/client";

const logger = getLogger();

const handler = async (event: SQSEvent) => {
  const apiKeyEither = await getClientAPIKey(getSsmClient(), logger);
  if (isLeft(apiKeyEither)) {
    return apiKeyEither;
  }

  const instagramClient = await getInstagramClient(apiKeyEither.right);
  const searchInstagramFn = makeSearchInstagram(instagramClient);

  return await makeSearcherHandler({
    logger,
    searchSocialMediaFn: searchInstagramFn,
  })(event);
};

export const lambdaHandler = defaultMiddlewareStack(handler);
