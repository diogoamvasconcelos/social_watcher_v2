import { positiveInteger } from "@diogovasconcelos/lib/iots";
import * as t from "io-ts";
import { NumberFromString } from "io-ts-types";
import { keywordCodec } from "./keyword";
import {
  discordNotificationConfigCodec,
  slackNotificationConfigCodec,
} from "./notificationJob";
import { emailReportConfigCodec } from "./reportJob";
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

// - Io types and codecs are used at the interfaces, and are less restrictive
//  - this allows for having different versions in the database/api
// - Domain types ensure all fields of the latest version exists

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
export const hackernewsSearchDataCodec = socialMediaSearchDataCodec;
export const instagramSearchDataCodec = socialMediaSearchDataCodec;

const searchObjectSearchData = {
  twitter: twitterSearchDataCodec,
  reddit: redditSearchDataCodec,
  hackernews: hackernewsSearchDataCodec,
  instagram: instagramSearchDataCodec,
};

const searchObjectNotificationData = {
  discordNotification: discordNotificationConfigCodec,
  slackNotification: slackNotificationConfigCodec,
};

const searchObjectReportData = {
  emailReport: emailReportConfigCodec,
};

export const searchObjectUserDataIoCodec = t.exact(
  t.intersection([
    t.type({
      keyword: keywordCodec,
      searchData: t.partial(searchObjectSearchData),
      notificationData: t.partial(searchObjectNotificationData),
    }),
    t.partial({
      reportData: t.partial(searchObjectReportData),
    }),
  ])
);
export type SearchObjectUserDataIo = t.TypeOf<
  typeof searchObjectUserDataIoCodec
>;

export const searchObjectUserDataDomainCodec = t.exact(
  t.type({
    keyword: keywordCodec,
    searchData: t.type(searchObjectSearchData),
    notificationData: t.type(searchObjectNotificationData),
    reportData: t.type(searchObjectReportData),
  })
);
export type SearchObjectUserDataDomain = t.TypeOf<
  typeof searchObjectUserDataDomainCodec
>;
export const searchObjectUserDataIoToDomain = (
  io: SearchObjectUserDataIo,
  defaultData?: Omit<SearchObjectUserDataDomain, "keyword">
): SearchObjectUserDataDomain => {
  // adds defaults do Io
  if (!defaultData) {
    defaultData = {
      searchData: {
        twitter: { enabledStatus: "DISABLED" },
        reddit: {
          enabledStatus: "DISABLED",
          over18: false,
        },
        hackernews: { enabledStatus: "DISABLED" },
        instagram: { enabledStatus: "DISABLED" },
      },
      notificationData: {
        discordNotification: {
          enabledStatus: "DISABLED",
          channel: "",
          bot: {
            credentials: { token: "" },
          },
        },
        slackNotification: {
          enabledStatus: "DISABLED",
          channel: "",
          bot: {
            credentials: { token: "" },
          },
        },
      },
      reportData: {
        emailReport: {
          status: "DISABLED",
        },
      },
    };
  }

  return {
    ...io,
    searchData: {
      twitter: io.searchData.twitter ?? defaultData.searchData.twitter,
      reddit: io.searchData.reddit ?? defaultData.searchData.reddit,
      hackernews: io.searchData.hackernews ?? defaultData.searchData.hackernews,
      instagram: io.searchData.instagram ?? defaultData.searchData.instagram,
    },
    notificationData: {
      discordNotification:
        io.notificationData.discordNotification ??
        defaultData.notificationData.discordNotification,
      slackNotification:
        io.notificationData.slackNotification ??
        defaultData.notificationData.slackNotification,
    },
    reportData: {
      emailReport:
        io.reportData?.emailReport ?? defaultData.reportData.emailReport,
    },
  };
};

export const searchObjectIndexCodec = t.union([
  NumberFromString.pipe(positiveInteger),
  positiveInteger,
]);
const searchObjectBaseCodec = t.type({
  type: t.literal("SEARCH_OBJECT"),
  id: userIdCodec,
  index: searchObjectIndexCodec,
  lockedStatus: t.union([t.literal("LOCKED"), t.literal("UNLOCKED")]),
});

export const searchObjectIoCodec = t.intersection([
  searchObjectBaseCodec,
  searchObjectUserDataIoCodec,
]);
export type SearchObjectIo = t.TypeOf<typeof searchObjectIoCodec>;

export const searchObjectDomainCodec = t.intersection([
  searchObjectBaseCodec,
  searchObjectUserDataDomainCodec,
]);
export type SearchObjectDomain = t.TypeOf<typeof searchObjectDomainCodec>;
export const searchObjectIoToDomain = (
  io: SearchObjectIo
): SearchObjectDomain => {
  return {
    ...io,
    ...searchObjectUserDataIoToDomain(io),
  };
};

// +++++++++++++
// + USER ITEM +
// +++++++++++++

export const userItemIoCodec = t.union([
  userDataCodec,
  searchObjectIoCodec,
  paymentDataCodec,
]);
export type UserItemDomain =
  | t.TypeOf<typeof userDataCodec>
  | SearchObjectDomain
  | t.TypeOf<typeof paymentDataCodec>;
