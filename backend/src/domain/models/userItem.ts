import * as t from "io-ts";
import { NumberFromString } from "io-ts-types";
import { positiveInteger } from "../../lib/iots";
import { keywordCodec } from "./keyword";
import { discordNotificationConfigCodec } from "./notificationJob";
import { userCodec, userIdCodec } from "./user";

// +++++++++++++
// + USER DATA +
// +++++++++++++
export const userDataCodec = t.intersection([
  t.type({ type: t.literal("USER_DATA") }),
  userCodec,
]);
export type UserData = t.TypeOf<typeof userDataCodec>;

// +++++++++++++
// + PAYMENT DATA +
// +++++++++++++
export const paymentDataCodec = t.exact(
  t.type({
    type: t.literal("PAYMENT_DATA"),
    id: userIdCodec,
    stripe: t.type({
      customerId: t.string,
      subscriptionId: t.string,
    }),
  })
);
export type PaymentData = t.TypeOf<typeof paymentDataCodec>;

// +++++++++++++++++
// + SEARCH OBJECT +
// +++++++++++++++++
export const socialMediaSearchData = t.type({
  enabledStatus: t.union([t.literal("DISABLED"), t.literal("ENABLED")]),
});
export type SocialMediaSearchData = t.TypeOf<typeof socialMediaSearchData>;

export const twitterSearchData = socialMediaSearchData;

export const searchObjectUserDataCodec = t.exact(
  t.type({
    keyword: keywordCodec,
    searchData: t.type({
      twitter: twitterSearchData,
    }),
  })
);
export type SearchObjectUserData = t.TypeOf<typeof searchObjectUserDataCodec>;

export const searchObjectIndexCodec = t.union([
  NumberFromString.pipe(positiveInteger),
  positiveInteger,
]);

export const searchObjectCodec = t.intersection([
  t.intersection([
    t.type({
      type: t.literal("SEARCH_OBJECT"),
      id: userIdCodec,
      index: searchObjectIndexCodec,
      lockedStatus: t.union([t.literal("LOCKED"), t.literal("UNLOCKED")]),
    }),
    t.partial({
      discordNotification: discordNotificationConfigCodec,
    }),
  ]),
  searchObjectUserDataCodec,
]);
export type SearchObject = t.TypeOf<typeof searchObjectCodec>;

// +++++++++++++
// + USER ITEM +
// +++++++++++++

export const userItemCodec = t.union([
  userDataCodec,
  searchObjectCodec,
  paymentDataCodec,
]);
export type UserItem = t.TypeOf<typeof userItemCodec>;
