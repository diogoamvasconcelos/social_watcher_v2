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

- only one socialMediaType: twitter
  - translate twit
- manually add data to the KeywordsTable for testing
- have this running on a CRON setup
- have DLQ in place
- add a nice logger (with context, and remove console.logs)
- add "with_environemnt" script
- use new io-ts decode/etc libs

# Phase 2 - Tests, DevX, CI and Envs (2 week)

- add tests
  - unit
    - with_env_vars script
  - local integration (ddblocal)
    - with_dynamodb script
    - with_es script
  - env (integration and acceptance)
- add Ops
  - clean database
  - dlq managment
- add CI steps
  - lint && format
  - build
  - local tests
  - deploy
  - env tests
  - test coverage report
  - vuln scanning
- CI scripts
  - do simple as you will deploy manually
- Env creation
  - dev, staging (master only) and production (master only)
    - share some resources like ES on dev & staging (only in phase 4)
    - different config on these (ES size, etc)

# Phase 3 - user/keyword API (1 week)

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
