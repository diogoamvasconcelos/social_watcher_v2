import * as t from "io-ts";

export const reportMediumCodec = t.literal("email");
export type ReportMedium = t.TypeOf<typeof reportMediumCodec>;

export const reportMediums: ReportMedium[] = ["email"];
