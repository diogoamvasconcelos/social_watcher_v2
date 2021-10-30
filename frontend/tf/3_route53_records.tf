resource "aws_route53_record" "root_txt" {
  zone_id = aws_route53_zone.main.zone_id
  name    = local.page_url
  type    = "TXT"
  ttl     = "3600"

  records = [
    # fastmail
    "v=spf1 include:spf.messagingengine.com ?all",
    # https://search.google.com/search-console/about
    "google-site-verification=GHk7w8-ZTI9ZkCJ0HWIrrEHy-ckWzofqEvh6HE6ILxs",
  ]
}

# Fastmail related for forwarding email: https://www.fastmail.help/hc/en-us/articles/1500000280261
# ref: https://github.com/bluk/terraform-aws-fastmail-dns/blob/master/main.tf
# ref: https://www.fastmail.help/hc/en-us/articles/360060591153-Domains-Advanced-configuration

resource "aws_route53_record" "fm-mx" {
  zone_id = aws_route53_zone.main.zone_id
  name    = local.page_url
  ttl     = 3600
  type    = "MX"
  records = [
    "20 in2-smtp.messagingengine.com.",
    "10 in1-smtp.messagingengine.com.",
  ]
}

resource "aws_route53_record" "fm1_domainkey_cname" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "fm1._domainkey"
  type    = "CNAME"
  ttl     = "3600"

  records = [
    "fm1.${local.page_url}.dkim.fmhosted.com",
  ]
}

resource "aws_route53_record" "fm2_domainkey_cname" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "fm2._domainkey"
  type    = "CNAME"
  ttl     = "3600"

  records = [
    "fm2.${local.page_url}.dkim.fmhosted.com",
  ]
}

resource "aws_route53_record" "fm3_domainkey_cname" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "fm3._domainkey"
  type    = "CNAME"
  ttl     = "3600"

  records = [
    "fm3.${local.page_url}.dkim.fmhosted.com",
  ]
}
