resource "aws_s3_bucket" "frontent_logs" {
  bucket = "sw-frontent-logs"
  acl    = "private" #default

  tags = local.tags
}
