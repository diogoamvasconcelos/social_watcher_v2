# Reference to RAPIDAPI ssm parameter so it an be added to the lambda env vars
# 'instagram-scraping' app requires env vars to be loaded at module load time,
# and lazy loading them makes webpack remove the module due to tree shaking
resource "aws_ssm_parameter" "rapidapi_keys" {
  name      = "rapidapi_keys"
  type      = "SecureString"
  value     = "not defined here"
  overwrite = false
  lifecycle {
    ignore_changes = [ value ]
  }
}
