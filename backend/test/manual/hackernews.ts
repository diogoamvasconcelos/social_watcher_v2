import { getLogger } from "../../src/lib/logger";
import { getClient, getItem, search } from "../../src/lib/hackernews/client";
import { fromEither } from "@diogovasconcelos/lib/iots";

const logger = getLogger();

const searchHN = async () => {
  const client = getClient();
  const result = fromEither(
    await search({ client, logger }, "pureref", { minutesAgo: 20 })
  );
  console.log(result);
};

const getItemHn = async () => {
  const client = getClient();
  const result = fromEither(await getItem({ client, logger }, "276060990"));
  console.log(result);
};

export const main = async () => {
  await searchHN();
  await getItemHn();
};

//void main();
