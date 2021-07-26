import { SQSEvent } from "aws-lambda";
import { getClient as getSsmClient } from "../../lib/ssm";
import { getLogger } from "../../lib/logger";
import { defaultMiddlewareStack } from "../middlewares/common";
import { makeSearcherHandler } from "./shared";
import { makeSearchInstagram } from "../../adapters/instagramSearcher/searchInstagram";
import { isLeft } from "fp-ts/lib/Either";
import {
  getClient as getInstagramClient,
  getClientAPIKey,
} from "../../adapters/instagramSearcher/client";

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
