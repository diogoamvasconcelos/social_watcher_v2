> Note: don't forget uncomment the `void main()` and comment it back after running any of the scripts

## Create indices in AWS env (search_result)

```
scripts/with_env.js 'yarn ts-node --files -r tsconfig-paths/register scripts/ops/create_es_index.ts' --env dev
```

## Start elasticsearch proxy

```
scripts/with_env.js 'yarn amazon-elasticsearch-proxy $MAIN_ELASTIC_SEARCH_URL' --env dev
```

> to open Kibana, goto: http://127.0.0.1:9200/_plugin/kibana/

## Resync all searchResults

- First, run the `clear the index` op

```
scripts/with_env.js 'yarn ts-node --files -r tsconfig-paths/register scripts/ops/clear_es_index.ts' --env dev
```

- Then, run the `resync` op

```
scripts/with_env.js 'yarn ts-node --files -r tsconfig-paths/register scripts/ops/resync_all_search_results_to_es.ts' --env dev
```
