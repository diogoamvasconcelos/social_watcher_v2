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

## Update ts for frontend

```
yarn tsc -b
```
