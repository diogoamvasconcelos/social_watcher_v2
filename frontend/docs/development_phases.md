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
