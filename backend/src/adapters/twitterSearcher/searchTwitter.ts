import { isLeft, left } from "fp-ts/lib/Either";
import { Keyword } from "../../domain/models/keyword";
import { SearchTwitterFn } from "../../domain/ports/twitterSearcher/searchTwitter";
import { searchRecent } from "../../lib/twitter";
import { Client } from "./client";

export const makeSearchTwitter = (client: Client): SearchTwitterFn => {
  return async (keyword: Keyword) => {
    const result = await searchRecent(client, keyword, {
      maxResults: 100,
      minutesAgo: 10,
    });

    if (isLeft(result)) {
      console.error(result.left);
      return left("ERROR");
    }

    return result;
  };
};
