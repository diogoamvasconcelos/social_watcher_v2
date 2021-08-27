import { isLeft, left, right } from "fp-ts/lib/Either";
import { SearchRedditFn } from "@src/domain/ports/redditSearcher/searchReddit";
import { searchAll } from "@src/lib/reddit/client";
import { Client, outToDomain } from "./client";

// TODO: respect user's searchObject "over_18" when notifying and searching (filter out at that point)

export const makeSearchReddit = (client: Client): SearchRedditFn => {
  return async (logger, keyword) => {
    const results = await searchAll({ logger, client }, keyword, {
      limit: 100,
      t: "hour",
      include_over_18: true,
    });

    if (isLeft(results)) {
      logger.error("reddit searchAll failed", { error: results.left });
      return left("ERROR");
    }

    return right(results.right.map((result) => outToDomain(keyword, result)));
  };
};
