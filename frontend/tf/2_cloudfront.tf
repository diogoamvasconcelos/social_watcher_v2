locals {
  s3_origin_id = aws_s3_bucket.fe_page.id
}

resource "aws_cloudfront_origin_access_identity" "fe_origin" {
  comment = "Origin Access Identity for Bucket: ${local.s3_origin_id}"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.fe_page.bucket_regional_domain_name
    origin_id   = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.fe_origin.cloudfront_access_identity_path
    }
  }

  aliases = [local.page_url]

  enabled = true

  default_root_object = local.index_document

  logging_config {
    include_cookies = false
    bucket          = aws_s3_bucket.frontent_logs.bucket_domain_name
    prefix          = "cloudfront"
  }

  default_cache_behavior {
    allowed_methods  = ["HEAD", "GET", "OPTIONS"]
    cached_methods   = ["HEAD", "GET", "OPTIONS"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # ordered_cache_behavior {
  #   path_pattern     = "*.html" //cache only for initial html
  #   allowed_methods  = ["HEAD", "GET", "OPTIONS"]
  #   cached_methods   = ["HEAD", "GET", "OPTIONS"]
  #   target_origin_id = local.s3_origin_id

  #   forwarded_values {
  #     query_string = false
  #     cookies {
  #       forward = "none"
  #     }
  #   }

  #   viewer_protocol_policy = "redirect-to-https"
  #   min_ttl                = 0
  #   default_ttl            = 3600
  #   max_ttl                = 86400
  #   compress               = true
  # }

  price_class = "PriceClass_200"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  custom_error_response {
    # check docs/decisions/react_router_html_problem.md to know more
    error_code         = 403 #Forbidden
    response_code      = 200
    response_page_path = "/${local.index_document}"
  }

  viewer_certificate {
    #cloudfront_default_certificate = true
    acm_certificate_arn = aws_acm_certificate_validation.main.certificate_arn
    ssl_support_method  = "sni-only"
  }

  tags = local.tags
}
