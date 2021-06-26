import { isLeft, left, right } from "fp-ts/lib/Either";
import { SearchHackernewsFn } from "../../domain/ports/hackernewsSearcher/searchHackernews";
import { Client, outToDomain } from "./client";
import { search } from "../../lib/hackernews/client";

export const makeSearchHackernews = (client: Client): SearchHackernewsFn => {
  return async (logger, keyword) => {
    const results = await search({ logger, client }, keyword, {
      maxResults: 100,
      minutesAgo: 20,
    });

    if (isLeft(results)) {
      logger.error("hackernews search failed", { error: results.left });
      return left("ERROR");
    }

    return right(results.right.map((result) => outToDomain(keyword, result)));
  };
};
