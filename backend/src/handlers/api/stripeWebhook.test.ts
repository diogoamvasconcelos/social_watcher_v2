import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "./stripeWebhook";
import * as stripeClient from "@src/lib/stripe/client";
import { isLeft, right } from "fp-ts/lib/Either";
import * as logger from "@src/lib/logger";
import { loggerMock } from "@test/lib/mocks";

jest.spyOn(logger, "getLogger").mockReturnValue(loggerMock);

describe("handlers/api/stripeWebhook", () => {
  beforeAll(async () => {
    jest.setTimeout(10000);
  });

  it("can handle a subcription created stripe event", async () => {
    const eventBody =
      '{\n  "id": "evt_1Io0AnDuqMWaCw564BCXMPa5",\n  "object": "event",\n  "api_version": "2020-08-27",\n  "created": 1620280497,\n  "data": {\n    "object": {\n      "id": "sub_JQruCtaiy2d27G",\n      "object": "subscription",\n      "application_fee_percent": null,\n      "billing_cycle_anchor": 1621144496,\n      "billing_thresholds": null,\n      "cancel_at": null,\n      "cancel_at_period_end": false,\n      "canceled_at": null,\n      "collection_method": "charge_automatically",\n      "created": 1620280496,\n      "current_period_end": 1621144496,\n      "current_period_start": 1620280496,\n      "customer": "cus_JQruY4EFnYdCRz",\n      "days_until_due": null,\n      "default_payment_method": null,\n      "default_source": null,\n      "default_tax_rates": [\n\n      ],\n      "discount": null,\n      "ended_at": null,\n      "items": {\n        "object": "list",\n        "data": [\n          {\n            "id": "si_JQrupIAptOtIpJ",\n            "object": "subscription_item",\n            "billing_thresholds": null,\n            "created": 1620280497,\n            "metadata": {\n            },\n            "plan": {\n              "id": "dummy",\n              "object": "plan",\n              "active": true,\n              "aggregate_usage": null,\n              "amount": 500,\n              "amount_decimal": "500",\n              "billing_scheme": "per_unit",\n              "created": 1620159011,\n              "currency": "usd",\n              "interval": "month",\n              "interval_count": 1,\n              "livemode": false,\n              "metadata": {\n              },\n              "nickname": null,\n              "product": "prod_JQLFbh8TnUL5Iq",\n              "tiers_mode": null,\n              "transform_usage": {\n                "divide_by": 5,\n                "round": "up"\n              },\n              "trial_period_days": null,\n              "usage_type": "licensed"\n            },\n            "price": {\n              "id": "dummy",\n              "object": "price",\n              "active": true,\n              "billing_scheme": "per_unit",\n              "created": 1620159011,\n              "currency": "usd",\n              "livemode": false,\n              "lookup_key": null,\n              "metadata": {\n              },\n              "nickname": null,\n              "product": "prod_JQLFbh8TnUL5Iq",\n              "recurring": {\n                "aggregate_usage": null,\n                "interval": "month",\n                "interval_count": 1,\n                "trial_period_days": null,\n                "usage_type": "licensed"\n              },\n              "tiers_mode": null,\n              "transform_quantity": {\n                "divide_by": 5,\n                "round": "up"\n              },\n              "type": "recurring",\n              "unit_amount": 500,\n              "unit_amount_decimal": "500"\n            },\n            "quantity": 1,\n            "subscription": "sub_JQruCtaiy2d27G",\n            "tax_rates": [\n\n            ]\n          }\n        ],\n        "has_more": false,\n        "total_count": 1,\n        "url": "/v1/subscription_items?subscription=sub_JQruCtaiy2d27G"\n      },\n      "latest_invoice": "in_1Io0AmDuqMWaCw56SvH4pBFK",\n      "livemode": false,\n      "metadata": {\n      },\n      "next_pending_invoice_item_invoice": null,\n      "pause_collection": null,\n      "pending_invoice_item_interval": null,\n      "pending_setup_intent": null,\n      "pending_update": null,\n      "plan": {\n        "id": "dummy",\n        "object": "plan",\n        "active": true,\n        "aggregate_usage": null,\n        "amount": 500,\n        "amount_decimal": "500",\n        "billing_scheme": "per_unit",\n        "created": 1620159011,\n        "currency": "usd",\n        "interval": "month",\n        "interval_count": 1,\n        "livemode": false,\n        "metadata": {\n        },\n        "nickname": null,\n        "product": "prod_JQLFbh8TnUL5Iq",\n        "tiers_mode": null,\n        "transform_usage": {\n          "divide_by": 5,\n          "round": "up"\n        },\n        "trial_period_days": null,\n        "usage_type": "licensed"\n      },\n      "quantity": 1,\n      "schedule": null,\n      "start_date": 1620280496,\n      "status": "trialing",\n      "transfer_data": null,\n      "trial_end": 1621144496,\n      "trial_start": 1620280496\n    }\n  },\n  "livemode": false,\n  "pending_webhooks": 1,\n  "request": {\n    "id": "req_680f3Q9RJAQ0SU",\n    "idempotency_key": null\n  },\n  "type": "customer.subscription.created"\n}';

    jest
      .spyOn(stripeClient, "verifyWebhookEvent")
      .mockReturnValueOnce(right(JSON.parse(eventBody)));

    const event: APIGatewayProxyEvent = {
      body: eventBody,
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    expect(isLeft(response)).toBeTruthy();
    if (isLeft(response)) {
      // Doesn't test much, but this test is hard to do as a unit test...
      expect(response.left.statusCode).toEqual(500);

      expect(loggerMock.error).toHaveBeenCalledWith(
        "stripe::customers.retrieve retrieved a deleted user",
        expect.anything()
      );
    }
  });
});
