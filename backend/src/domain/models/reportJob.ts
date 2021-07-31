import * as t from "io-ts";
import { searchResultCodec } from "./searchResult";
import { dateISOString, emailFromString } from "@diogovasconcelos/lib/iots";

const reportFrequencyCodec = t.union([t.literal("DAILY"), t.literal("WEEKLY")]);

const reportConfigBaseCodec = t.type({
  status: t.union([t.literal("DISABLED"), reportFrequencyCodec]),
});

const reportJobBaseCodec = t.type({
  searchResults: t.array(searchResultCodec),
  searchedFrom: dateISOString,
});

// +++++++++
// + EMAIL +
// +++++++++

export const emailReportConfigCodec = t.intersection([
  reportConfigBaseCodec,
  t.type({
    addresses: t.array(emailFromString),
  }),
]);
export type EmailReportConfig = t.TypeOf<typeof emailReportConfigCodec>;

export const emailReportJobCodec = t.intersection([
  reportJobBaseCodec,
  t.type({
    reportMedium: t.literal("email"),
    config: emailReportConfigCodec,
  }),
]);
export type EmailReportJob = t.TypeOf<typeof emailReportJobCodec>;
