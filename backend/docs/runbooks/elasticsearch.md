## Create indices in AWS env (search_result)

```
scripts/with_env.js npx ts-node scripts/ops/create_es_index.ts --env dev
```

## Start elasticsearch proxy

```
scripts/with_env.js 'npx amazon-elasticsearch-proxy $MAIN_ELASTIC_SEARCH_URL' --env dev
```
