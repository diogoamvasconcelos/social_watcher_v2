# Changing mappings / re-indexing with zero downtime

- https://www.elastic.co/blog/changing-mapping-with-zero-downtime

# Guide to nice config (shards, replicas, nodes, etc)

- https://thoughts.t37.net/designing-the-perfect-elasticsearch-cluster-the-almost-definitive-guide-e614eabc1a87

# You can use 'create' to make sure you don't overwrite document

- otherwise use 'index' which you can versioning to if needed (https://www.elastic.co/blog/elasticsearch-versioning-support). Nice for event sourcing!
