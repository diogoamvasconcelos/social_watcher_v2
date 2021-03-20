import * as t from "io-ts";

export const socialMediaCodec = t.literal("twitter"); //t.union([t.literal("twitter")]);
export type SocialMedia = t.TypeOf<typeof socialMediaCodec>;

export const socialMedias: SocialMedia[] = ["twitter"];
