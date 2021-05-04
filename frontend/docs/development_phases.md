# Phase 0 - Bootstrap (1 week)

- yarn, parcel, react, typecript <DONE>
- build hello world page <DONE>
- configure linter, tsconfig, etc <DONE>
- add scripts for linting, tsc , testing (checkall) <DONE>
- shared "config.ts" between fe and be (and use it for cognito/auth/amplify) <DONE>

# Phase 1 - Simple MVP

- Login <DONE>
- Display user search objects <DONE>
  - update search object <DONE>
- search a keyword <DONE>
  - search for text <DONE>
- work in the CORS issue (localhost): <DONE>
  - allow localhost:1234 <DONE>
- add unit test <DONE>
  - test for JSONViwer <DONE>
- add testing framework <DONE>
- add userIcon and submenu for account and logout to navbar <DONE>
  - add test <DONE>

# Phase 2 - Subscription and Stripe

- create trial account

  - evaluate if should use this instead: https://stripe.com/docs/billing/subscriptions/overview#non-payment
    - stripe might be able to do this for us
    - more info:
      - https://stripe.com/docs/billing/subscriptions/trials
      - https://stackoverflow.com/a/41999174 (trial without needing payment data!! nice)
  - all new accounts have that type
    - lasts 10 days
    - has 5 search words
    - has timestamp when it expires
  - visuaize the trial on FE and how much time left for expiration
  - send an email when 3 days are left
    - use this event from stripe: customer.subscription.trial_will_end
    - use step function as fallback (only send if conditions still apply)
  - change to invalid account after expiration
    - rely on stripe events
    - use step function (only send if conditions still apply) as fallback

- manage subscription
  - start 5nofsearchreaults subscription
  - cancel subscription
  - webhook integration (handle state changes: https://stripe.com/docs/billing/subscriptions/overview#subscription-statuses and the events)
    - on success payment
    - on failure
    - on cancel
  - change to invalid when time is up and no payment (stripe has notifications for this but nice to have a fallback like 48hour grace period)
    - use step function for this fallback
  - stripe can handle email notifications
    - https://stripe.com/docs/billing/invoices/sending#overdue
  - source of truth for subscription is in stipe -> in backend is just a eventual consist replication
  - be able to re-activate a deactivated or cancelled account (test both cases)

# Phase 3 - More Features

- Different pages
  - search objects
  - search
    - pagination
    - filtering
    - sorting
- Deploy in (dev)
- work in the CORS issue (real page, some-cool-subdomain.thesocialwatcher.com):
  - https://www.rehanvdm.com/serverless/cloudfront-reverse-proxy-api-gateway-to-prevent-cors/index.html
  - https://advancedweb.hu/how-cloudfront-solves-cors-problems/
  - setup cloudfront that routes to apigw (/api/) and page in S3 (/)
- Some CI pipeline
  - linting
  - typechecking
  - testing
  - building
  - deploying

# Misc TODO

- handle unconfirmed user
