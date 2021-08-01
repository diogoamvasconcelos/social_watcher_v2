import * as t from "io-ts";
import { searchResultCodec } from "./searchResult";
import { dateISOString, emailFromString } from "@diogovasconcelos/lib/iots";
import { nonEmptyArray } from "io-ts-types";
import { keywordCodec } from "./keyword";

const reportFrequencyCodec = t.union([t.literal("DAILY"), t.literal("WEEKLY")]);
export type ReportFrequency = t.TypeOf<typeof reportFrequencyCodec>;

const reportConfigBaseCodec = t.type({
  status: t.union([t.literal("DISABLED"), reportFrequencyCodec]),
});

const reportJobBaseCodec = t.intersection([
  t.type({
    keyword: keywordCodec,
    searchResults: t.array(searchResultCodec),
    searchFrequency: reportFrequencyCodec,
  }),
  t.partial({
    searchStart: dateISOString,
    searchEnd: dateISOString,
  }),
]);
export type ReportJobBase = t.TypeOf<typeof reportJobBaseCodec>;

// +++++++++
// + EMAIL +
// +++++++++

export const emailReportConfigCodec = t.intersection([
  reportConfigBaseCodec,
  t.partial({
    addresses: nonEmptyArray(emailFromString),
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

// +++++++
// + All +
// +++++++
export const reportJobCodec = emailReportJobCodec;
export type ReportJob = t.TypeOf<typeof reportJobCodec>;
