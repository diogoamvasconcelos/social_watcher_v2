import { dateISOString, optional } from "@diogovasconcelos/lib/iots";
import * as t from "io-ts";

export const twitterCredentialsCodec = t.type({
  apiKey: t.string,
  apiSecretKey: t.string,
  bearerToken: t.string,
});
export type TwitterCredentials = t.TypeOf<typeof twitterCredentialsCodec>;

export const searchRecentResponseItemCodec = t.type({
  id: t.string,
  text: t.string,
  created_at: dateISOString,
  conversation_id: t.string,
  author_id: t.string,
  lang: t.string,
});
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

export type SearchRecentOptions = {
  maxResults: number;
  minutesAgo: number;
};
