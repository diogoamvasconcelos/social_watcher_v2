import * as t from "io-ts";
import { optional } from "../iots";

// ref: https://stripe.com/docs/api/subscriptions/update
export const customerSubscriptionEventDataCodec = t.type({
  object: t.type({
    id: t.string,
    customer: t.string,
    default_payment_method: optional(t.string),
    status: t.string,
    items: t.type({
      data: t.array(
        t.type({
          id: t.string,
          plan: t.type({
            id: t.string,
          }),
          price: t.type({
            id: t.string,
          }),
          quantity: t.number,
        })
      ),
    }),
  }),
});
export type CustomerSubscriptionEventData = t.TypeOf<
  typeof customerSubscriptionEventDataCodec
>;
