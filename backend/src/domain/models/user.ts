import { dateISOString, positiveInteger } from "@diogovasconcelos/lib/iots";
import * as t from "io-ts";

export const userIdCodec = t.string;
export type UserId = t.TypeOf<typeof userIdCodec>;

export const subscriptionDataCodec = t.intersection([
  t.type({
    status: t.union([
      // Based on Stripe Subscription Status (moved "trialing" to type)
      t.literal("ACTIVE"),
      t.literal("CANCELED"),
      t.literal("INCOMPLETE"),
      t.literal("INCOMPLETE_EXPIRED"),
      t.literal("PAST_DUE"),
      t.literal("UNPAID"),
    ]),
    type: t.union([
      t.literal("NORMAL"),
      t.literal("SUPER"),
      t.literal("TRIAL"),
    ]),
    nofSearchObjects: positiveInteger,
  }),
  t.partial({
    expiresAt: dateISOString,
  }),
]);

export type SubscriptionData = t.TypeOf<typeof subscriptionDataCodec>;

export const userCodec = t.intersection([
  t.type({ id: userIdCodec }),
  t.type({ email: t.string }),
  t.type({ subscription: subscriptionDataCodec }),
]);
export type User = t.TypeOf<typeof userCodec>;
