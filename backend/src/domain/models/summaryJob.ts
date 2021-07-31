import * as t from "io-ts";
import { searchResultCodec } from "./searchResult";
import { dateISOString, emailFromString } from "@diogovasconcelos/lib/iots";

const summaryFrequencyCodec = t.union([
  t.literal("DAILY"),
  t.literal("WEEKLY"),
]);

const summaryConfigBaseCodec = t.type({
  status: t.union([t.literal("DISABLED"), summaryFrequencyCodec]),
});

const summaryJobBaseCodec = t.type({
  searchResults: t.array(searchResultCodec),
  searchedFrom: dateISOString,
});

// +++++++++
// + EMAIL +
// +++++++++

export const emailSummaryConfigCodec = t.intersection([
  summaryConfigBaseCodec,
  t.type({
    addresses: t.array(emailFromString),
  }),
]);
export type EmailSummaryConfig = t.TypeOf<typeof emailSummaryConfigCodec>;

export const emailSummaryJobCodec = t.intersection([
  summaryJobBaseCodec,
  t.type({
    summaryMedium: t.literal("email"),
    config: emailSummaryConfigCodec,
  }),
]);
export type EmailSummaryJob = t.TypeOf<typeof emailSummaryJobCodec>;
