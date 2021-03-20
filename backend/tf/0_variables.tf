
# environment vars
variable "aws_region" {}
variable "env" {}
variable "out_dir" {}
variable "tf_dir" {}
locals {
  lambda_file = "${var.out_dir}/lambda_artifact.zip"

  lambda_env_vars = {
    ENV_NAME = var.env
    AWS_NODEJS_CONNECTION_REUSE_ENABLED = 1
    KEYWORDS_TABLE_NAME = aws_dynamodb_table.keywords.name
  }

  tags = {
    project = "social watcher"
  }
}
