# Start ES locally

```
scripts/local_stack/with_elasticsearch_local.sh zsh
```

## Check nodes

```
curl -X GET "localhost:9200/_cat/nodes?v=true&pretty" | jq
```

## Put document

```
curl -X PUT "localhost:9200/customer/_doc/1?pretty" -H 'Content-Type: application/json' -d'
{
  "name": "John Doe"
}
' | jq
```

## Get document

```
curl -X GET "localhost:9200/customer/_doc/1?pretty" | jq
```

## Check indices

```
curl "localhost:9200/_cat/indices?v=true"
```

## Search

```
curl -X GET "localhost:9200/customer/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": { "match_all": {} },
  "sort": [
    { "account_number": "asc" }
  ]
}
' | jq
```

## Get index mapping

```
curl -X GET "localhost:9200/my-index-000001/_mapping?pretty" | jq
```
