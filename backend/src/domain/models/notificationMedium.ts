import * as t from "io-ts";

export const notificationMediumCodec = t.literal("discord"); //t.union([t.literal("discord")]);
export type NotificationMedium = t.TypeOf<typeof notificationMediumCodec>;

export const notificationMediums: NotificationMedium[] = ["discord"];
