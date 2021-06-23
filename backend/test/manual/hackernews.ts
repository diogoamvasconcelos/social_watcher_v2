import { getLogger } from "../../src/lib/logger";
import { getClient, search } from "../../src/lib/hackernews/client";
import { fromEither } from "@diogovasconcelos/lib";

const logger = getLogger();

const searchHN = async () => {
  const client = getClient();
  const result = fromEither(
    await search({ client, logger }, "ADA", { minutesAgo: 100 })
  );
  console.log(result);
};

export const main = async () => {
  await searchHN();
};

void main();
