import * as t from "io-ts";

export const socialMediaCodec = t.union([
  t.literal("twitter"),
  t.literal("reddit"),
  t.literal("hackernews"),
]);
export type SocialMedia = t.TypeOf<typeof socialMediaCodec>;

export const socialMedias: SocialMedia[] = ["twitter", "reddit", "hackernews"];
