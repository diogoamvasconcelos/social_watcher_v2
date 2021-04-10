resource "aws_elasticsearch_domain" "main" {
  domain_name = "main"
  # https://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-version-migration.html
  elasticsearch_version = "7.9"

  # https://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/sizing-domains.html
  # check average item size on search-results table to get an idea of size required
  cluster_config {
    instance_type          = "t3.small.elasticsearch" # free-tier
    instance_count         = 1
    zone_awareness_enabled = false
  }

  # required by t3.small.elasticsearch 
  ebs_options {
    ebs_enabled = true
    volume_type = "gp2" # update to gp3 (cheaper and faster) once is supported by terraform...
    volume_size = 10    # free-tier
  }

  tags = local.tags
}

output "main_es_url" {
  value = aws_elasticsearch_domain.main.endpoint
}
output "main_es_kibana_url" {
  value = aws_elasticsearch_domain.main.kibana_endpoint
}
