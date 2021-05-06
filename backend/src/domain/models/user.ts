import * as t from "io-ts";
import { positiveInteger } from "../../lib/iots";

export const userIdCodec = t.string;
export type UserId = t.TypeOf<typeof userIdCodec>;

export const subscriptionDataCodec = t.type({
  subscriptionStatus: t.union([
    // Based on Stripe Subscription Status (moved "trialing" to type)
    t.literal("ACTIVE"),
    t.literal("CANCELED"),
    t.literal("INCOMPLETE"),
    t.literal("INCOMPLETE_EXPIRED"),
    t.literal("PAST_DUE"),
    t.literal("UNPAID"),
  ]),
  subscriptionType: t.union([
    t.literal("NORMAL"),
    t.literal("SUPER"),
    t.literal("TRIAL"),
  ]),
  nofSearchObjects: positiveInteger,
});

export type SubscriptionData = t.TypeOf<typeof subscriptionDataCodec>;

export const userCodec = t.intersection([
  t.type({ id: userIdCodec }),
  t.type({ email: t.string }),
  subscriptionDataCodec,
]);
export type User = t.TypeOf<typeof userCodec>;
