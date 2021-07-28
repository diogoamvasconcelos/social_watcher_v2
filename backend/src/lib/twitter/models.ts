import { dateISOString, optional } from "@diogovasconcelos/lib/iots";
import * as t from "io-ts";

export const twitterCredentialsCodec = t.type({
  apiKey: t.string,
  apiSecretKey: t.string,
  bearerToken: t.string,
});
export type TwitterCredentials = t.TypeOf<typeof twitterCredentialsCodec>;

export const searchRecentResponseItemCodec = t.intersection([
  t.type({
    id: t.string,
    text: t.string,
    created_at: dateISOString,
    conversation_id: t.string,
    author_id: t.string,
    lang: t.string,
  }),
  t.partial({
    followers_count: t.number, // optional because it was added later
  }),
]);
export type SearchRecentResponseItem = t.TypeOf<
  typeof searchRecentResponseItemCodec
>;
export const searchRecentResponseMetaCodec = t.type({
  result_count: t.number,
  newest_id: optional(t.string),
  oldest_id: optional(t.string),
  next_token: optional(t.string),
});
export const searchRecentResponseCodec = t.type({
  data: t.array(searchRecentResponseItemCodec),
  meta: searchRecentResponseMetaCodec,
});
export type SearchRecentResponse = t.TypeOf<typeof searchRecentResponseCodec>;

export const getUserResponseCodec = t.type({
  data: t.type({
    id: t.string,
    name: t.string,
    username: t.string,
    public_metrics: t.type({
      followers_count: t.number,
      following_count: t.number,
      tweet_count: t.number,
      listed_count: t.number,
    }),
  }),
});
export type GetUserResponse = t.TypeOf<typeof getUserResponseCodec>;
