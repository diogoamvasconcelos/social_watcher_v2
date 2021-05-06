import { APIGatewayProxyEvent } from "aws-lambda";
import { fromEither } from "../../lib/iots";
import { handler } from "./stripeWebhook";

describe("handlers/api/stripeWebhook", () => {
  // Need to skip this test because we can't fake a valid signature
  it.skip("can handle a stripe event", async () => {
    const event: APIGatewayProxyEvent = ({
      resource: "/stripe-escondido-webhook",
      path: "/stripe-escondido-webhook",
      httpMethod: "POST",
      headers: {
        Accept: "*/*; q=0.5, application/xml",
        "Cache-Control": "no-cache",
        "CloudFront-Forwarded-Proto": "https",
        "CloudFront-Is-Desktop-Viewer": "true",
        "CloudFront-Is-Mobile-Viewer": "false",
        "CloudFront-Is-SmartTV-Viewer": "false",
        "CloudFront-Is-Tablet-Viewer": "false",
        "CloudFront-Viewer-Country": "US",
        "Content-Type": "application/json; charset=utf-8",
        Host: "r2iyq5t3oe.execute-api.us-east-1.amazonaws.com",
        "Stripe-Signature":
          "t=1620280497,v1=6889affeab2b1beb3c812c7d68ba8b52b8f85ee78c20cc79229608f77aab4f80,v0=e2e2cb6602c5f47ecb0c504c6de134504f1f328341b78219730ffbf95149ca75",
        "User-Agent": "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
        Via: "1.1 d1151317ba32afe0e6370fd69fed222e.cloudfront.net (CloudFront)",
        "X-Amz-Cf-Id":
          "d9GJ2tQGCjO48eNYT9OqK7Og-V4k-UpEPOzoac9kGqfBwKZeDWeNgQ==",
        "X-Amzn-Trace-Id": "Root=1-609384b1-3885787212d0fbd74bc19f02",
        "X-Forwarded-For": "54.187.216.72, 70.132.31.158",
        "X-Forwarded-Port": "443",
        "X-Forwarded-Proto": "https",
      },
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {
        resourceId: "6w9bvr",
        resourcePath: "/stripe-escondido-webhook",
        httpMethod: "POST",
        extendedRequestId: "e5GryFWOoAMFXPg=",
        requestTime: "06/May/2021:05:54:57 +0000",
        path: "/api/stripe-escondido-webhook",
        accountId: "317887603465",
        protocol: "HTTP/1.1",
        stage: "api",
        domainPrefix: "r2iyq5t3oe",
        requestTimeEpoch: 1620280497737,
        requestId: "55772cc6-61bf-4a53-8387-0104c9ad1435",
        identity: {
          cognitoIdentityPoolId: null,
          accountId: null,
          cognitoIdentityId: null,
          caller: null,
          sourceIp: "54.187.216.72",
          principalOrgId: null,
          accessKey: null,
          cognitoAuthenticationType: null,
          cognitoAuthenticationProvider: null,
          userArn: null,
          userAgent: "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
          user: null,
        },
        domainName: "r2iyq5t3oe.execute-api.us-east-1.amazonaws.com",
        apiId: "r2iyq5t3oe",
      },
      body:
        '{\n  "id": "evt_1Io0AnDuqMWaCw564BCXMPa5",\n  "object": "event",\n  "api_version": "2020-08-27",\n  "created": 1620280497,\n  "data": {\n    "object": {\n      "id": "sub_JQruCtaiy2d27G",\n      "object": "subscription",\n      "application_fee_percent": null,\n      "billing_cycle_anchor": 1621144496,\n      "billing_thresholds": null,\n      "cancel_at": null,\n      "cancel_at_period_end": false,\n      "canceled_at": null,\n      "collection_method": "charge_automatically",\n      "created": 1620280496,\n      "current_period_end": 1621144496,\n      "current_period_start": 1620280496,\n      "customer": "cus_JQruY4EFnYdCRz",\n      "days_until_due": null,\n      "default_payment_method": null,\n      "default_source": null,\n      "default_tax_rates": [\n\n      ],\n      "discount": null,\n      "ended_at": null,\n      "items": {\n        "object": "list",\n        "data": [\n          {\n            "id": "si_JQrupIAptOtIpJ",\n            "object": "subscription_item",\n            "billing_thresholds": null,\n            "created": 1620280497,\n            "metadata": {\n            },\n            "plan": {\n              "id": "price_1InUZLDuqMWaCw56vjA9oh7M",\n              "object": "plan",\n              "active": true,\n              "aggregate_usage": null,\n              "amount": 500,\n              "amount_decimal": "500",\n              "billing_scheme": "per_unit",\n              "created": 1620159011,\n              "currency": "usd",\n              "interval": "month",\n              "interval_count": 1,\n              "livemode": false,\n              "metadata": {\n              },\n              "nickname": null,\n              "product": "prod_JQLFbh8TnUL5Iq",\n              "tiers_mode": null,\n              "transform_usage": {\n                "divide_by": 5,\n                "round": "up"\n              },\n              "trial_period_days": null,\n              "usage_type": "licensed"\n            },\n            "price": {\n              "id": "price_1InUZLDuqMWaCw56vjA9oh7M",\n              "object": "price",\n              "active": true,\n              "billing_scheme": "per_unit",\n              "created": 1620159011,\n              "currency": "usd",\n              "livemode": false,\n              "lookup_key": null,\n              "metadata": {\n              },\n              "nickname": null,\n              "product": "prod_JQLFbh8TnUL5Iq",\n              "recurring": {\n                "aggregate_usage": null,\n                "interval": "month",\n                "interval_count": 1,\n                "trial_period_days": null,\n                "usage_type": "licensed"\n              },\n              "tiers_mode": null,\n              "transform_quantity": {\n                "divide_by": 5,\n                "round": "up"\n              },\n              "type": "recurring",\n              "unit_amount": 500,\n              "unit_amount_decimal": "500"\n            },\n            "quantity": 1,\n            "subscription": "sub_JQruCtaiy2d27G",\n            "tax_rates": [\n\n            ]\n          }\n        ],\n        "has_more": false,\n        "total_count": 1,\n        "url": "/v1/subscription_items?subscription=sub_JQruCtaiy2d27G"\n      },\n      "latest_invoice": "in_1Io0AmDuqMWaCw56SvH4pBFK",\n      "livemode": false,\n      "metadata": {\n      },\n      "next_pending_invoice_item_invoice": null,\n      "pause_collection": null,\n      "pending_invoice_item_interval": null,\n      "pending_setup_intent": null,\n      "pending_update": null,\n      "plan": {\n        "id": "price_1InUZLDuqMWaCw56vjA9oh7M",\n        "object": "plan",\n        "active": true,\n        "aggregate_usage": null,\n        "amount": 500,\n        "amount_decimal": "500",\n        "billing_scheme": "per_unit",\n        "created": 1620159011,\n        "currency": "usd",\n        "interval": "month",\n        "interval_count": 1,\n        "livemode": false,\n        "metadata": {\n        },\n        "nickname": null,\n        "product": "prod_JQLFbh8TnUL5Iq",\n        "tiers_mode": null,\n        "transform_usage": {\n          "divide_by": 5,\n          "round": "up"\n        },\n        "trial_period_days": null,\n        "usage_type": "licensed"\n      },\n      "quantity": 1,\n      "schedule": null,\n      "start_date": 1620280496,\n      "status": "trialing",\n      "transfer_data": null,\n      "trial_end": 1621144496,\n      "trial_start": 1620280496\n    }\n  },\n  "livemode": false,\n  "pending_webhooks": 1,\n  "request": {\n    "id": "req_680f3Q9RJAQ0SU",\n    "idempotency_key": null\n  },\n  "type": "customer.subscription.created"\n}',
      isBase64Encoded: false,
    } as unknown) as APIGatewayProxyEvent;

    const response = fromEither(await handler(event));
    expect(response.statusCode).toEqual(200);
  });
});
