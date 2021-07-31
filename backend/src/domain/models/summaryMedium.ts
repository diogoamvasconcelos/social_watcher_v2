import * as t from "io-ts";

export const summaryMediumCodec = t.literal("email");
export type SummaryMedium = t.TypeOf<typeof summaryMediumCodec>;

export const notificationMediums: SummaryMedium[] = ["email"];
