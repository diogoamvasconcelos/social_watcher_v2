# Guides

- https://miketabor.com/host-static-website-using-aws-s3/
  - nice guide to get an idea, but use Terraform for configuring all the resources
- https://www.azavea.com/blog/2018/07/16/provisioning-acm-certificates-on-aws-with-terraform/
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/acm_certificate_validation (for ssl configuration)

# Step-by-step

- Setup aws_s3_bucket
- Setup aws_cloudfront_distribution
- Create aws_route53_zone (to use our custom domain from namesilo)
- Create aws_route53_records (NS and A)
  - update the name servers on namesilo with the values created by the NS record
- Create aws_acm_certificate (for SSL)
