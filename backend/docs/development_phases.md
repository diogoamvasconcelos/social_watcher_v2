- ref diagram: https://app.diagrams.net/?src=about#G1YHbgpcvR9pP_tzMrNsFfxIuAGx8_yU4c

# Phase 0 - Bootstrap (3 days)

- create repo <DONE>
- create and config aws account <DONE>
- simple infrastructure scaffolding <DONE>
  - terraform config for a lambda <DONE>
  - lambda code (print event) <DONE>
    - add linter, formatter, packages, etc... <DONE>
  - simple build_and_deploy script <DONE>
- design docs and architecture <DONE>
  - task breakdown <DONE>
- indieHackers post <DONE>
- get a domain <DONE>

# Phase 1 - Search Keyword in Twitter CRON MVP (1 week)

- only one socialMediaType: twitter <DONE>
  - translate twit <DONE>
- manually add data to the KeywordsTable for testing <DONE>
- have this running on a CRON setup <DONE>
- have DLQ in place <DONE>
- add a nice logger (with context, and remove console.logs) <DONE>
  - uniform error logging on ./lib <DONE>
  - add a middleware to inject context and try-catch on handlers <DONE>
- add "with_environemnt" script <DONE>

# Phase 2 - Tests, DevX, CI and Envs (1 week)

- add tests
  - unit <DONE>
  - local integration (ddblocal) <DONE>
    - with_dynamodb script (using docker) <DONE>
  - env (integration and acceptance) <DONE>/<SKIP>
- add Ops
  - clean database <DONE>
  - dlq managment <SKIP>
- add CI steps
  - lint && format <DONE>
  - build <DONE>
  - local tests <DONE>
  - deploy <DONE>
  - env tests <DONE>
  - test coverage report <DONE>
  - vuln scanning <DONE>
- CI scripts
  - do simple as you will deploy manually <HALFDONE>
- Env creation <SKIP>
  - dev, staging (master only) and production (master only)
    - share some resources like ES on dev & staging (only in phase 4)
    - different config on these (ES size, etc)

# Phase 3 - user/keyword API (1 week)

- congnito
  - auth <DONE>
  - create user <DONE>
  - login / token <DONE>
    - https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-server-contract-reference.html
- apigw handler
  - middlewares <DONE>
    - errors, 400 / 500 <DONE>
  - env tests (axios client)
    - test user credentials <DONE>
- userDB
  - ddbstream <DONE>
    - activate/deactivate keywords <DONE>
- API - REST
  - POST user/id/keyword (add new keyword) <DONE>
  - GET user/id (user data with keyword list) <DONE>

# Phase 4 - Sync searchResults to ElasticSearch (1 week)

- deploy ES (not on a VPC) <DONE>
  - env setup <SKIP>
- with_es_local script <DONE>
- create ES utils
  - auth and kibana access <DONE>
  - add/update index (use alias!) <HALF_DONE>
- create nice ES lib <DONE>
- sync to ES
  - stream consumer -> SQS -> syncToEs -> ES <DONE>
  - env test (add messages to SQS, check that are in ES) <DONE>

# Phase 5 - Search Results endpoint (1 week)

- create endpoint <DONE>
- with Auth <DONE>
  - check if keyword if valid <DONE>
- with filters/queries and pagination (SSLF) <DONE>
- add envtests <DONE>
  - keyword not allowed <DONE>
  - sort by happenedAt and id <DONE>
  - pagination <TODO>

# Phase 6 - NotifyDiscord integration (1 week)

- add SQS->DispatchNotifyDiscordJobs (Lambda)

  - gets the keyword data (on new searchResult) <DONE>
  - lambda creates notifyDiscordJobs (checks users table, gets channel, bot and messageFormat data) <DONE>
  - integration tests

- add SQS->notifyDiscord (lambda)

  - discord client <DONE>
    - tests for bad credentials
  - gets the notifyDiscordJobs, and writes to Discord <DONE>
  - integration tests (not sure if possible)

- do frontend part :) <DONE>

# Phase 7 - Stripe integration (maybe after FE)

- store stripe id in users table
  "Cognito just had a big release, so there might be a better way to do this now. Here is how I did it. I created a user table in DynamoDB. Then I created a lambda trigger to update DB that fires when a user has registered. Then another lambda trigger when the user verifies their email. Finally, I created a lambda function to run the server-side of the stripe script. This server side code will also update the user table when a user pays the subscription fee."
- stripeClient

- the real deal
  - on account creation:
    - create account in stripe and store customer data <DONE>
    - start subscription (Normal -> trial 10 days): <DONE>
    - update user subscription (Active, trial) <DONE>
    - write integration test (check in stripe that user was created with subscription and 10 day trial) <DONE>
  - on subscription changed events:
    - ref: https://stripe.com/docs/billing/subscriptions/integrating-customer-portal#webhooks
    - on paid -> convert to non-trial (good state) <DONE>
    - on cancelled -> deactivate (cancelled state) <DONE>
    - on trial expired -> deactivate (trial expired state) <DONE>
    - on subscription expired -> deactivate (expired state) <DONE>
      - implementation:
        - get user by stripe customerID <DONE>
        - update paymentData on new subscription <DONE>
        - update suer on subscription update <DONE>
  - create "customer-portal-session" endpoint <DONE>
    - ref: https://stripe.com/docs/billing/subscriptions/integrating-customer-portal
  - add CRON function to daily check the status of accounts (check if match stripe status)
    - on mismatch, send me email! <TODO>

# Phase 8 - consolidation and more features

- fix code sharing
  - use yarn-link for @shared/lib
    - create a private npm package instead - @diogovasconcelos/lib
  - share APIClient and types with frontend
- add reddit search
- add slack notifier
