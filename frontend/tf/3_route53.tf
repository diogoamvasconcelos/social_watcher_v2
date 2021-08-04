resource "aws_route53_zone" "main" {
  name = local.page_url

  tags = local.tags
}

resource "aws_route53_record" "main-ns" {
  name    = local.page_url
  ttl     = 1800 #30min
  type    = "NS"
  zone_id = aws_route53_zone.main.zone_id

  records = aws_route53_zone.main.name_servers
}

resource "aws_route53_record" "main-a" {
  name    = local.page_url
  type    = "A"
  zone_id = aws_route53_zone.main.zone_id

  alias {
    name                   = aws_cloudfront_distribution.s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

# Used to validate the acm certificate for SSL (https://www.azavea.com/blog/2018/07/16/provisioning-acm-certificates-on-aws-with-terraform/)
resource "aws_route53_record" "validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  name    = each.value.name
  records = [each.value.record]
  ttl     = 60
  type    = each.value.type
  zone_id = aws_route53_zone.main.zone_id
}
