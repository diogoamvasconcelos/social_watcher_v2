import * as t from "io-ts";
import { optionalNull } from "@diogovasconcelos/lib/iots";

export const stripeCredentialsCodec = t.type({
  pk: t.string,
  sk: t.string,
  webhookSecret: t.string,
});
export type StripeCredentials = t.TypeOf<typeof stripeCredentialsCodec>;

// ref: https://stripe.com/docs/api/subscriptions/update
export const customerSubscriptionEventDataCodec = t.type({
  object: t.type({
    id: t.string,
    customer: t.string,
    default_payment_method: optionalNull(t.string),
    status: t.string,
    trial_end: optionalNull(t.number),
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

/*
const subscreatedEventExample = {
  id: "evt_1Io0AnDuqMWaCw564BCXMPa5",
  object: "event",
  api_version: "2020-08-27",
  created: 1620280497,
  data: {
    object: {
      id: "sub_JQruCtaiy2d27G",
      object: "subscription",
      application_fee_percent: null,
      billing_cycle_anchor: 1621144496,
      billing_thresholds: null,
      cancel_at: null,
      cancel_at_period_end: false,
      canceled_at: null,
      collection_method: "charge_automatically",
      created: 1620280496,
      current_period_end: 1621144496,
      current_period_start: 1620280496,
      customer: "cus_JQruY4EFnYdCRz",
      days_until_due: null,
      default_payment_method: null,
      default_source: null,
      default_tax_rates: [],
      discount: null,
      ended_at: null,
      items: {
        object: "list",
        data: [
          {
            id: "si_JQrupIAptOtIpJ",
            object: "subscription_item",
            billing_thresholds: null,
            created: 1620280497,
            metadata: {},
            plan: {
              id: "price_1InUZLDuqMWaCw56vjA9oh7M",
              object: "plan",
              active: true,
              aggregate_usage: null,
              amount: 500,
              amount_decimal: "500",
              billing_scheme: "per_unit",
              created: 1620159011,
              currency: "usd",
              interval: "month",
              interval_count: 1,
              livemode: false,
              metadata: {},
              nickname: null,
              product: "prod_JQLFbh8TnUL5Iq",
              tiers_mode: null,
              transform_usage: { divide_by: 5, round: "up" },
              trial_period_days: null,
              usage_type: "licensed",
            },
            price: {
              id: "price_1InUZLDuqMWaCw56vjA9oh7M",
              object: "price",
              active: true,
              billing_scheme: "per_unit",
              created: 1620159011,
              currency: "usd",
              livemode: false,
              lookup_key: null,
              metadata: {},
              nickname: null,
              product: "prod_JQLFbh8TnUL5Iq",
              recurring: {
                aggregate_usage: null,
                interval: "month",
                interval_count: 1,
                trial_period_days: null,
                usage_type: "licensed",
              },
              tiers_mode: null,
              transform_quantity: { divide_by: 5, round: "up" },
              type: "recurring",
              unit_amount: 500,
              unit_amount_decimal: "500",
            },
            quantity: 1,
            subscription: "sub_JQruCtaiy2d27G",
            tax_rates: [],
          },
        ],
        has_more: false,
        total_count: 1,
        url: "/v1/subscription_items?subscription=sub_JQruCtaiy2d27G",
      },
      latest_invoice: "in_1Io0AmDuqMWaCw56SvH4pBFK",
      livemode: false,
      metadata: {},
      next_pending_invoice_item_invoice: null,
      pause_collection: null,
      pending_invoice_item_interval: null,
      pending_setup_intent: null,
      pending_update: null,
      plan: {
        id: "price_1InUZLDuqMWaCw56vjA9oh7M",
        object: "plan",
        active: true,
        aggregate_usage: null,
        amount: 500,
        amount_decimal: "500",
        billing_scheme: "per_unit",
        created: 1620159011,
        currency: "usd",
        interval: "month",
        interval_count: 1,
        livemode: false,
        metadata: {},
        nickname: null,
        product: "prod_JQLFbh8TnUL5Iq",
        tiers_mode: null,
        transform_usage: { divide_by: 5, round: "up" },
        trial_period_days: null,
        usage_type: "licensed",
      },
      quantity: 1,
      schedule: null,
      start_date: 1620280496,
      status: "trialing",
      transfer_data: null,
      trial_end: 1621144496,
      trial_start: 1620280496,
    },
  },
  livemode: false,
  pending_webhooks: 1,
  request: { id: "req_680f3Q9RJAQ0SU", idempotency_key: null },
  type: "customer.subscription.created",
};
*/
