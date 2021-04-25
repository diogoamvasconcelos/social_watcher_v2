# Phase 0 - Bootstrap (1 week)

- yarn, parcel, react, typecript <DONE>
- build hello world page <DONE>
- configure linter, tsconfig, etc <DONE>
- add scripts for linting, tsc , testing (checkall) and building
- shared "config.ts" between fe and be (and use it for cognito/auth/amplify) <DONE>
- work in the CORS issue:
  - https://www.rehanvdm.com/serverless/cloudfront-reverse-proxy-api-gateway-to-prevent-cors/index.html
  - https://advancedweb.hu/how-cloudfront-solves-cors-problems/
  - setup cloudfront that routes to apigw (/api/) and page in S3 (/)
