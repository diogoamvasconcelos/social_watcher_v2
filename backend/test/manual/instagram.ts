import { getLogger } from "../../src/lib/logger";
import { search } from "../../src/lib/instagram/client";
import { fromEither } from "@diogovasconcelos/lib/iots";
import util from "util";

const logger = getLogger();

const searchInstagram = async () => {
  const result = fromEither(await search({ logger }, "pureref"));
  console.log(util.inspect(result, { showHidden: false, depth: null }));
  console.log(
    result.map((res) => ({ shortcode: res.shortcode, isvideo: res.is_video }))
  );
};

export const main = async () => {
  try {
    await searchInstagram();
  } catch (error) {
    logger.error("main failed", { error });
  }
};

void main();
