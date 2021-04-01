
# environment vars
variable "aws_region" {}
variable "env" {}
variable "out_dir" {}
variable "tf_dir" {}
locals {
  lambda_file = "${var.out_dir}/lambda_artifact.zip"

  lambda_env_vars = {
    ENV = var.env
    AWS_NODEJS_CONNECTION_REUSE_ENABLED = 1
    USERS_TABLE_NAME = aws_dynamodb_table.users.name
    KEYWORDS_TABLE_NAME = aws_dynamodb_table.keywords.name
    SEARCH_RESULTS_TABLE_NAME = aws_dynamodb_table.search_results.name
    SEARCH_JOBS_QUEUE_TEMPLATE_NAME = "{socialMedia}_search_jobs"
  }

  tags = {
    project = "social watcher"
  }
}
