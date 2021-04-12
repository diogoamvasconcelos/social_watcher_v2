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
curl -X GET "localhost:9200/search_result/_doc/1?pretty" | jq
```

## Check indices

```
curl "localhost:9200/_cat/indices?v=true"
```

## Search

```
curl -X GET "localhost:9200/search_result/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": { "match_all": {} },
  "sort": [
    { "happenedAt": "desc" }
  ]
}
' | jq
```

```
curl -X GET "localhost:9200/search_result/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "query_string": {
      "query": "Unique #0da9cd9d-bc80-4cc9-9837-5fdbea9aed3c",
      "default_field": "data"
    }
  }
}
' | jq
```

## Get index mapping

```
curl -X GET "localhost:9200/search_result/_mapping?pretty" | jq
```

## Get index stats (nof docs, etc)

```
curl -X GET "localhost:9200/search_result/_stats?pretty" | jq
```
