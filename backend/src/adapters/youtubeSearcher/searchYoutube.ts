import { isLeft, left, right } from "fp-ts/lib/Either";
import { SearchYoutubeFn } from "@src/domain/ports/youtubeSearcher/searchYoutube";
import { search } from "@src/lib/youtube/client";
import { Client, outToDomain } from "./client";

export const makeSearchYoutube = (client: Client): SearchYoutubeFn => {
  return async (logger, keyword) => {
    const results = await search({ logger, client }, keyword);

    if (isLeft(results)) {
      logger.error("youtube search failed", { error: results.left });
      return left("ERROR");
    }

    return right(results.right.map((result) => outToDomain(keyword, result)));
  };
};
