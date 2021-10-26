import { isLeft, left, right } from "fp-ts/lib/Either";
import { search } from "@src/lib/instagram/client";
import { SearchInstagramFn } from "@src/domain/ports/instagramSearcher/searchInstagram";
import { Client, outToDomain } from "./client";

export const makeSearchInstagram = (client: Client): SearchInstagramFn => {
  return async (logger, keyword) => {
    const results = await search({ logger, client }, keyword, {
      maxResults: 200,
      minutesAgo: 60 * 24 * 1, // 1 day
    });

    if (isLeft(results)) {
      logger.error("instagram search failed", { error: results.left });
      return left("ERROR");
    }

    return right(results.right.map((result) => outToDomain(keyword, result)));
  };
};
