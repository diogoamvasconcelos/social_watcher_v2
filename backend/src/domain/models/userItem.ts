import { dateISOString, positiveInteger } from "@diogovasconcelos/lib/iots";
import { uuidCodec } from "../../lib/uuid";
import * as t from "io-ts";
import { NumberFromString } from "io-ts-types";
import { keywordCodec } from "./keyword";
import {
  discordNotificationConfigCodec,
  slackNotificationConfigCodec,
} from "./notificationJob";
import { emailReportConfigCodec } from "./reportJob";
import { userCodec, userIdCodec } from "./user";

// ++++++++
// + BASE +
// ++++++++
const userItemBaseCodec = t.type({
  id: userIdCodec,
});

// +++++++++++++
// + USER DATA +
// +++++++++++++
export const userDataCodec = t.intersection([
  userItemBaseCodec,
  t.type({ type: t.literal("USER_DATA") }),
  userCodec,
]);
export type UserData = t.TypeOf<typeof userDataCodec>;

// ++++++++++++++++
// + PAYMENT DATA +
// ++++++++++++++++
export const paymentDataCodec = t.exact(
  t.intersection([
    userItemBaseCodec,
    t.type({
      type: t.literal("PAYMENT_DATA"),
      stripe: t.type({
        customerId: t.string,
        subscriptionId: t.string,
      }),
    }),
  ])
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
export const hackernewsSearchDataCodec = t.intersection([
  socialMediaSearchDataCodec,
  t.type({
    fuzzyMatch: t.boolean,
  }),
]);
export const instagramSearchDataCodec = socialMediaSearchDataCodec;
export const youtubeSearchDataCodec = socialMediaSearchDataCodec;

const searchObjectSearchData = {
  twitter: twitterSearchDataCodec,
  reddit: redditSearchDataCodec,
  hackernews: hackernewsSearchDataCodec,
  instagram: instagramSearchDataCodec,
  youtube: youtubeSearchDataCodec,
};

const searchObjectNotificationData = {
  discord: discordNotificationConfigCodec,
  slack: slackNotificationConfigCodec,
};

const searchObjectReportData = {
  email: emailReportConfigCodec,
};

export const searchObjectUserDataIoCodec = t.exact(
  t.intersection([
    t.type({
      keyword: keywordCodec,
    }),
    t.partial({
      searchData: t.partial(searchObjectSearchData),
      notificationData: t.partial(searchObjectNotificationData),
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
  // adds defaults to Io
  if (!defaultData) {
    defaultData = {
      searchData: {
        twitter: { enabledStatus: "DISABLED" },
        reddit: {
          enabledStatus: "DISABLED",
          over18: true,
        },
        hackernews: {
          enabledStatus: "DISABLED",
          fuzzyMatch: false,
        },
        instagram: { enabledStatus: "DISABLED" },
        youtube: { enabledStatus: "DISABLED" },
      },
      notificationData: {
        discord: {
          enabledStatus: "DISABLED",
          channel: "",
          bot: {
            credentials: { token: "" },
          },
        },
        slack: {
          enabledStatus: "DISABLED",
          channel: "",
          bot: {
            credentials: { token: "" },
          },
        },
      },
      reportData: {
        email: {
          status: "DISABLED",
        },
      },
    };
  }

  // TODO: map this dude (this change)
  return {
    ...io,
    searchData: {
      twitter: io.searchData?.twitter ?? defaultData.searchData.twitter,
      reddit: io.searchData?.reddit ?? defaultData.searchData.reddit,
      hackernews:
        io.searchData?.hackernews ?? defaultData.searchData.hackernews,
      instagram: io.searchData?.instagram ?? defaultData.searchData.instagram,
      youtube: io.searchData?.youtube ?? defaultData.searchData.youtube,
    },
    notificationData: {
      discord:
        io.notificationData?.discord ?? defaultData.notificationData.discord,
      slack: io.notificationData?.slack ?? defaultData.notificationData.slack,
    },
    reportData: {
      email: io.reportData?.email ?? defaultData.reportData.email,
    },
  };
};

export const searchObjectIndexCodec = t.union([
  NumberFromString.pipe(positiveInteger),
  positiveInteger,
]);
const searchObjectBaseCodec = t.intersection([
  userItemBaseCodec,
  t.type({
    type: t.literal("SEARCH_OBJECT"),
    index: searchObjectIndexCodec,
    lockedStatus: t.union([t.literal("LOCKED"), t.literal("UNLOCKED")]),
    createdAt: dateISOString,
  }),
]);

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

// ++++++++++++++
// + RESULT TAG +
// ++++++++++++++

// Important: due to io-ts bug, `resultTagIdCodec` can't be used for searchResult["tags"] type
// when changing this type, please duplicate the changes there too
export const resultTagIdCodec = uuidCodec;

export const resultTagCodec = t.intersection([
  userItemBaseCodec,
  t.type({
    type: t.literal("RESULT_TAG"),
    tagId: resultTagIdCodec,
    tagType: t.union([t.literal("FAVORITE"), t.literal("CUSTOM")]),
    createdAt: dateISOString,
  }),
]);
export type ResultTag = t.TypeOf<typeof resultTagCodec>;

// +++++++++++++
// + USER ITEM +
// +++++++++++++

export const userItemIoCodec = t.union([
  userDataCodec,
  searchObjectIoCodec,
  paymentDataCodec,
  resultTagCodec,
]);
export type UserItemDomain =
  | UserData
  | SearchObjectDomain
  | PaymentData
  | ResultTag;
