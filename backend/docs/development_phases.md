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

- userDB
  - ddbstream
    - activate/deactivate keywords
- API - REST
  - POST sign-up
  - POST confirm-user
  - POST user/id/delete (?)
  - POST user/id/keyword (add new keyword)
  - GET/UPDATE user/id/keyword/id (get/update keyword data)
  - GET user/id (user data with keyword list)
  - POST result/search
- congnito
  - auth

# Phase 4 - Sync searchResults to ElasticSearch (1 week)

- deploy ES (on VPC)
  - env setup
- create ES utils
  - auth and kibana access
  - add/update index (use alias!)
- create nice ES lib

# Phase 5 - Search Results endpoint (1 week)

- with Auth
- with filters/queries and pagination (SSLF)

# Phase 6 - NotifyDiscord integration (1 week)

# Phase 7 - Stripe integration (maybe after FE)

- store stripe id in users table
  "Cognito just had a big release, so there might be a better way to do this now. Here is how I did it. I created a user table in DynamoDB. Then I created a lambda trigger to update DB that fires when a user has registered. Then another lambda trigger when the user verifies their email. Finally, I created a lambda function to run the server-side of the stripe script. This server side code will also update the user table when a user pays the subscription fee."
- stripeClient
  - create account and get keys
