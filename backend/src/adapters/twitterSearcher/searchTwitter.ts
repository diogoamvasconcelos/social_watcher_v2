import { isLeft, left, right } from "fp-ts/lib/Either";
import { searchRecent } from "@src/lib/twitter/client";
import { SearchTwitterFn } from "@src/domain/ports/twitterSearcher/searchTwitter";
import { Client, outToDomain } from "./client";

export const makeSearchTwitter = (client: Client): SearchTwitterFn => {
  return async (logger, keyword) => {
    const results = await searchRecent({ client, logger }, keyword, {
      maxResults: 100,
      minutesAgo: 20,
    });

    if (isLeft(results)) {
      logger.error("twitter searchRecent failed", { error: results.left });
      return left("ERROR");
    }

    return right(results.right.map((result) => outToDomain(keyword, result)));
  };
};
