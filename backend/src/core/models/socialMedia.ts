import * as t from "io-ts";

export const socialMedias = ["twitter"];
export const socialMediaCodec = t.union(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socialMedias.map((socialMedia: string) => t.literal(socialMedia)) as any
);
export type SocialMedia = t.TypeOf<typeof socialMediaCodec>;
