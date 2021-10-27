import * as t from "io-ts";
import { slackCredentialsCodec } from "../../lib/slack/models";
import { discordCredentialsCodec } from "../../lib/discord/models";
import { searchResultCodec } from "./searchResult";

const notificationConfigBaseCodec = t.type({
  enabledStatus: t.union([t.literal("DISABLED"), t.literal("ENABLED")]),
});

const notificationJobBaseCodec = t.type({
  searchResult: searchResultCodec,
});

// +++++++++++
// + Discord +
// +++++++++++
export const discordNotificationConfigCodec = t.intersection([
  notificationConfigBaseCodec,
  t.type({
    channel: t.string,
    bot: t.type({
      credentials: discordCredentialsCodec,
    }),
  }),
]);
export type DiscordNotificationConfig = t.TypeOf<
  typeof discordNotificationConfigCodec
>;

export const discordNotificationJobCodec = t.intersection([
  notificationJobBaseCodec,
  t.type({
    notificationMedium: t.literal("discord"),
    config: discordNotificationConfigCodec,
  }),
]);
export type DiscordNotificatonJob = t.TypeOf<
  typeof discordNotificationJobCodec
>;

// +++++++++++
// + Slack +
// +++++++++++

export const slackNotificationConfigCodec = t.intersection([
  notificationConfigBaseCodec,
  t.type({
    channel: t.string,
    bot: t.type({
      credentials: slackCredentialsCodec,
    }),
  }),
]);
export type SlackNotificationConfig = t.TypeOf<
  typeof slackNotificationConfigCodec
>;

export const slackNotificationJobCodec = t.intersection([
  notificationJobBaseCodec,
  t.type({
    notificationMedium: t.literal("slack"),
    config: slackNotificationConfigCodec,
  }),
]);
export type SlackNotificatonJob = t.TypeOf<typeof slackNotificationJobCodec>;

// +++++++
// + All +
// +++++++
export const notificationJobCodec = t.union([
  discordNotificationJobCodec,
  slackNotificationJobCodec,
]);
export type NotificationJob = t.TypeOf<typeof notificationJobCodec>;
