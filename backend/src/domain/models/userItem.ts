import * as t from "io-ts";
import { NumberFromString } from "io-ts-types";
import { positiveInteger } from "@diogovasconcelos/lib";
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
export const socialMediaSearchDataCodec = t.type({
  enabledStatus: t.union([t.literal("DISABLED"), t.literal("ENABLED")]),
});
export type SocialMediaSearchData = t.TypeOf<typeof socialMediaSearchDataCodec>;

export const twitterSearchDataCodec = socialMediaSearchDataCodec;
export const redditSearchDataCodec = t.intersection([
  socialMediaSearchDataCodec,
  t.type({
    over18: t.boolean,
  }),
]);

// TODO:
// - use codec for partial model: api data, and database data (where IO happens and io-ts decode is required)
// - make more strict domain model and a transfor function (no io-ts, pure TS type)

const searchObjectSearchData = {
  twitter: twitterSearchDataCodec,
  reddit: redditSearchDataCodec,
};

const searchObjectNotificationData = {
  discordNotification: discordNotificationConfigCodec,
};

export const searchObjectUserDataCodec = t.exact(
  t.type({
    keyword: keywordCodec,
    searchData: t.type(searchObjectSearchData),
    notificationData: t.partial(searchObjectNotificationData),
  })
);
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

export const userItemCodec = t.union([
  userDataCodec,
  searchObjectCodec,
  paymentDataCodec,
]);
export type UserItem = t.TypeOf<typeof userItemCodec>;
