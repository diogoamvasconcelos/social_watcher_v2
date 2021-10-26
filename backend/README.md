## Build and deploy

```
time scripts/ci_test_build_and_deploy.sh
```

## Run tests with logging

```
LOG_LEVEL=info && yarn test
```

## Run env tests

```
yarn test:environment
```

## Run single test

```
scripts/with_env.js yarn 'jest -t="some text"'
```

### Or file

```
scripts/with_env.js 'yarn jest --testMatch "<rootDir>test/environment/acceptance/paymentSubscription/trialCancellationAndReactivation.test.ts"' --env dev
```

## Update ts for frontend

```
yarn tsc -b
```

## Run ts-node

```
scripts/with_env.js 'yarn ts-node --files -r tsconfig-paths/register test/manual/youtube.ts' --env dev
```
