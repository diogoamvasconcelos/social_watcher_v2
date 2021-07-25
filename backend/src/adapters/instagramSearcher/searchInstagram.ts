import { isLeft, left, right } from "fp-ts/lib/Either";
import { search } from "../../lib/instagram/client";
import { SearchInstagramFn } from "../../domain/ports/instagramSearcher/searchInstagram";
import { outToDomain } from "./client";

export const makeSearchInstagram = (): SearchInstagramFn => {
  return async (logger, keyword) => {
    const results = await search({ logger }, keyword);

    if (isLeft(results)) {
      logger.error("instagram search failed", { error: results.left });
      return left("ERROR");
    }

    return right(results.right.map((result) => outToDomain(keyword, result)));
  };
};
