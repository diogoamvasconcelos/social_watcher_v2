import { getLogger } from "@src/lib/logger";
import { getClient, search } from "@src/lib/instagram/client";
import { fromEither, newLowerCase } from "@diogovasconcelos/lib/iots";
import util from "util";
import { buildSQSEvent } from "@test/lib/builders";
import { InstagramSearchJob } from "@src/domain/models/searchJob";
import { lambdaHandler } from "@src/handlers/searchers/searchInstagramHandler";

const logger = getLogger();

const searchInstagram = async () => {
  const client = await getClient("missing-api-key");
  const result = fromEither(
    await search({ logger, client }, "diogo vasconcelos")
  );
  console.log(util.inspect(result, { showHidden: false, depth: null }));
  console.log(
    result.map((res) => ({ shortcode: res.shortcode, isvideo: res.is_video }))
  );
};

const searchInstagramUsingHandler = async () => {
  const searchJob: InstagramSearchJob = {
    socialMedia: "instagram",
    keyword: newLowerCase("diogo vasconcelos"),
  };
  const searchJobEvent = buildSQSEvent([searchJob]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await lambdaHandler(searchJobEvent, {} as any, {} as any);
  logger.info("result", { result });
};

export const main = async () => {
  try {
    await searchInstagram();
    await searchInstagramUsingHandler();
  } catch (error) {
    logger.error("main failed", { error });
  }
};

//void main();
