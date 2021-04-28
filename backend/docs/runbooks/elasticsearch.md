## Create indices in AWS env (search_result)

```
scripts/with_env.js yarn ts-node scripts/ops/create_es_index.ts --env dev
```

## Start elasticsearch proxy

```
scripts/with_env.js 'yarn amazon-elasticsearch-proxy $MAIN_ELASTIC_SEARCH_URL' --env dev
```
