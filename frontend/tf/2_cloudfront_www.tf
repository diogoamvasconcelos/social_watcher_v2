
resource "aws_cloudfront_distribution" "www_redirect" {

  aliases = [local.www_page_url]

  enabled = true

  origin {
    domain_name = aws_s3_bucket.fe_page.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.fe_page.id
  }

  default_cache_behavior {
    allowed_methods  = ["HEAD", "GET", "OPTIONS"]
    cached_methods   = ["HEAD", "GET", "OPTIONS"]
    target_origin_id = aws_s3_bucket.fe_page.id

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.redirect_wwww.arn
    }
  }
  price_class = "PriceClass_200"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }


  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate_validation.www.certificate_arn
    ssl_support_method  = "sni-only"
  }


  tags = local.tags
}

resource "aws_cloudfront_function" "redirect_wwww" {
  name    = "redirect_wwww"
  runtime = "cloudfront-js-1.0"
  comment = "redirect www to naked (main)"
  publish = true
  code    = file("${var.tf_dir}/cloudfront_functions/redirect_www.js")
}
