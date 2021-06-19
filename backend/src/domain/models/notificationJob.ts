import * as t from "io-ts";
import { discordCredentialsCodec } from "../../lib/discord/models";
import { searchResultCodec } from "./searchResult";

const notificationConfigBaseCodec = t.type({
  enabledStatus: t.union([t.literal("DISABLED"), t.literal("ENABLED")]),
});

const notificationJobBaseCodec = t.type({
  searchResult: searchResultCodec,
});

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

export const notificationJobCodec = discordNotificationJobCodec; // t.intersection([iscordNotificationJobCodec);
export type NotificationJob = t.TypeOf<typeof notificationJobCodec>;
