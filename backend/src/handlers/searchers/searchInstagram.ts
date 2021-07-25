import { SQSEvent } from "aws-lambda";
import { getClient as getSsmClient } from "../../lib/ssm";
import { getLogger } from "../../lib/logger";
import { defaultMiddlewareStack } from "../middlewares/common";
import { makeSearcherHandler } from "./shared";
import { ensureAPIKeyInEnv } from "../../adapters/instagramSearcher/client";
import { makeSearchInstagram } from "../../adapters/instagramSearcher/searchInstagram";
import { isLeft } from "fp-ts/lib/Either";

const logger = getLogger();

const handler = async (event: SQSEvent) => {
  const ensureAPIKeyEither = await ensureAPIKeyInEnv(getSsmClient(), logger);
  if (isLeft(ensureAPIKeyEither)) {
    return ensureAPIKeyEither;
  }

  const searchInstagramFn = makeSearchInstagram();

  return await makeSearcherHandler({
    logger,
    searchSocialMediaFn: searchInstagramFn,
  })(event);
};

export const lambdaHandler = defaultMiddlewareStack(handler);
