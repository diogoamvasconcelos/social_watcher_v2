resource "aws_s3_bucket" "fe_page" {
  bucket = "fe_page"
  acl    = "private" #default

  tags = local.tags
}
