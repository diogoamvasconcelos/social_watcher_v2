resource "aws_s3_bucket" "fe_page" {
  bucket = "fe-page"
  acl    = "private" #default

  tags = local.tags
}

data "aws_iam_policy_document" "fe_page_s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.fe_page.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.fe_origin.iam_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "fe_page" {
  bucket = aws_s3_bucket.fe_page.id
  policy = data.aws_iam_policy_document.fe_page_s3_policy.json
}
