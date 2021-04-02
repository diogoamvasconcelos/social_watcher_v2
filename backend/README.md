## Build and deploy

```
time scripts/ci_test_build_and_deploy.sh
```

## Run tests with logging

```
LOG_LEVEL=info && npm run test
```

## Run env tests

```
npm run test:environment
```

## Run single test

```
scripts/with_env.js npx 'jest -t="some text"'
```
