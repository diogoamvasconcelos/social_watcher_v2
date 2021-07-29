resource "aws_ses_domain_identity" "main" {
  domain = local.page_url
}
# Need to use the `verification_token` that is outputted from this resource 
# to register a TXT on DNS of your domain registar 
# - namesilo, do it manually, if route53 this could be automated: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ses_domain_identity_verification

resource "aws_route53_record" "main_amazonses_verification_record" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_amazonses.${aws_ses_domain_identity.main.id}"
  type    = "TXT"
  ttl     = "600"
  records = [aws_ses_domain_identity.main.verification_token]
}

resource "aws_ses_domain_identity_verification" "main_verification" {
  domain = aws_ses_domain_identity.main.id

  depends_on = [aws_route53_record.main_amazonses_verification_record]
}
