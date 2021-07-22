import * as t from "io-ts";

export const notificationMediumCodec = t.union([
  t.literal("discord"),
  t.literal("slack"),
]);
export type NotificationMedium = t.TypeOf<typeof notificationMediumCodec>;

export const notificationMediums: NotificationMedium[] = ["discord", "slack"];
