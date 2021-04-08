import * as t from "io-ts";
import { NumberFromString } from "io-ts-types";
import { positiveInteger } from "../../lib/iots";
import { keywordCodec } from "./keyword";
import { userCodec, userIdCodec } from "./user";

// +++++++++++++
// + USER DATA +
// +++++++++++++
export const userDataCodec = t.intersection([
  t.type({ type: t.literal("USER_DATA") }),
  userCodec,
]);
export type UserData = t.TypeOf<typeof userDataCodec>;

// +++++++++++++++++
// + SEARCH OBJECT +
// +++++++++++++++++
export const socialMediaSearchData = t.type({
  enabledStatus: t.union([t.literal("DISABLED"), t.literal("ENABLED")]),
});
export type SocialMediaSearchData = t.TypeOf<typeof socialMediaSearchData>;

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
    type: t.literal("SEARCH_OBJECT"),
    id: userIdCodec,
    index: searchObjectIndexCodec,
    lockedStatus: t.union([t.literal("LOCKED"), t.literal("UNLOCKED")]),
  }),
  searchObjectUserDataCodec,
]);
export type SearchObject = t.TypeOf<typeof searchObjectCodec>;

// +++++++++++++
// + USER ITEM +
// +++++++++++++

export const userItemCodec = t.union([userDataCodec, searchObjectCodec]);
export type UserItem = t.TypeOf<typeof userItemCodec>;
