import { isLeft, left, right } from "fp-ts/lib/Either";
import { Keyword } from "../../domain/models/keyword";
import { SearchTwitterFn } from "../../domain/ports/twitterSearcher/searchTwitter";
import { searchRecent } from "../../lib/twitter";
import { Client, outToDomain } from "./client";

export const makeSearchTwitter = (client: Client): SearchTwitterFn => {
  return async (keyword: Keyword) => {
    const results = await searchRecent(client, keyword, {
      maxResults: 100,
      minutesAgo: 200,
    });

    if (isLeft(results)) {
      console.error(results.left);
      return left("ERROR");
    }

    return right(results.right.map((result) => outToDomain(keyword, result)));
  };
};
