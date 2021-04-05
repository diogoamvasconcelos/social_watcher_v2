import * as t from "io-ts";
import { NumberFromString } from "io-ts-types";
import { positiveInteger } from "../../lib/iots";
import { keywordCodec } from "./keyword";
import { userIdCodec } from "./user";

export const socialMediaSearchData = t.type({
  enabledStatus: t.union([t.literal("DISABLED"), t.literal("ENABLED")]),
});

export const twitterSearchData = socialMediaSearchData;

export const searchObjectUserDataCodec = t.type({
  keyword: keywordCodec,
  searchData: t.type({
    twitter: twitterSearchData,
  }),
});
export type SearchObjectUserData = t.TypeOf<typeof searchObjectUserDataCodec>;

export const searchObjectIndexCodec = t.union([
  NumberFromString.pipe(positiveInteger),
  positiveInteger,
]);

export const searchObjectCodec = t.intersection([
  t.type({
    userId: userIdCodec,
    index: searchObjectIndexCodec,
    lockedStatus: t.union([t.literal("LOCKED"), t.literal("UNLOCKED")]),
  }),
  searchObjectUserDataCodec,
]);
export type SearchObject = t.TypeOf<typeof searchObjectCodec>;
