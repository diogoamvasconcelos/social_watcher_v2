import { getLogger } from "../../src/lib/logger";
import { fromEither } from "@diogovasconcelos/lib/iots";
import { getClient, search } from "../../src/lib/youtube/client";
import { getClient as getSsmClient } from "../../src/lib/ssm";
import { getClientCredentials as getYoutubeCredentials } from "../../src/adapters/youtubeSearcher/client";

const logger = getLogger();

const searchYoutube = async () => {
  const youtubeCredentials = await getYoutubeCredentials(
    getSsmClient(),
    logger
  );

  const client = getClient(youtubeCredentials);
  const result = fromEither(
    await search({ client, logger }, "diogo vasconcelos", {
      minutesAgo: 60 * 24,
    })
  );
  console.log(result);
};

export const main = async () => {
  await searchYoutube();
};

//void main();
