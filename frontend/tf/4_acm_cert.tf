// main
resource "aws_acm_certificate" "main" {
  domain_name       = local.page_url
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = local.tags
}

resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.validation : record.fqdn]
}

// www
resource "aws_acm_certificate" "www" {
  domain_name       = local.www_page_url
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = local.tags
}

resource "aws_acm_certificate_validation" "www" {
  certificate_arn         = aws_acm_certificate.www.arn
  validation_record_fqdns = [for record in aws_route53_record.validation_www : record.fqdn]
}
