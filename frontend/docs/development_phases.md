# Phase 0 - Bootstrap (1 week)

- yarn, parcel, react, typecript <DONE>
- build hello world page <DONE>
- configure linter, tsconfig, etc <DONE>
- add scripts for linting, tsc , testing (checkall) <DONE>
- shared "config.ts" between fe and be (and use it for cognito/auth/amplify) <DONE>

# Phase 1 - Simple MVP

- Login <DONE>
- DIsplay user search objects <DONE>
  - update search object
- search a keyword <DONE>
  - search for text
- add color pallet (greyscale)
- work in the CORS issue (localhost): <DONE>
  - allow localhost:1234 <DONE
- add unit test
- add testing framework

# Phase 2 - More Features

- Different pages
  - search objects
  - search
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
