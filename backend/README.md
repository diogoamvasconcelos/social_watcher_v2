## Build and deploy

```
time scripts/ci_test_build_and_deploy.sh
```

## Run tests with logging

```
LOG_LEVEL=info && scripts/local_stack/with_dynamodb_local.sh npm run test
```

## Run env tests

```
npm run test:environment
```
