import * as t from "io-ts";
import { positiveInteger } from "../../lib/iots";

export const subscriptionDataCodec = t.type({
  subscriptionStatus: t.union([t.literal("ACTIVE"), t.literal("INACTIVE")]),
  subscriptionType: t.union([t.literal("NORMAL"), t.literal("SUPER")]),
  nofKeywords: positiveInteger,
});
export type SubscriptionData = t.TypeOf<typeof subscriptionDataCodec>;

export const userCodec = t.intersection([
  t.type({ id: t.string }),
  t.type({ email: t.string }),
  subscriptionDataCodec,
]);
export type User = t.TypeOf<typeof userCodec>;
