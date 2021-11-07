
# environment vars
variable "aws_region" {}
variable "env" {}
variable "out_dir" {}
variable "tf_dir" {}

# config-specific envinoment vars
variable "stripe_product_normal_id" {}
variable "stripe_product_test_id" {}
locals {

  is_prod        = var.env == "prod"
  lambda_handler = "index.lambdaHandler"

  lambda_env_vars = {
    ENV                                    = var.env
    AWS_NODEJS_CONNECTION_REUSE_ENABLED    = 1
    NODE_OPTIONS                           = "--enable-source-maps"
    USERS_TABLE_NAME                       = aws_dynamodb_table.users.name
    KEYWORDS_TABLE_NAME                    = aws_dynamodb_table.keywords.name
    SEARCH_RESULTS_TABLE_NAME              = aws_dynamodb_table.search_results.name
    SEARCH_JOBS_QUEUE_TEMPLATE_NAME        = "{socialMedia}_search_jobs"
    MAIN_ELASTIC_SEARCH_URL                = "https://${aws_elasticsearch_domain.main.endpoint}"
    SEARCH_RESULT_INDEX_VERSION            = 1
    SYNC_SEARCH_RESULTS_TO_ES_QUEUE_URL    = aws_sqs_queue.sync_search_results_to_es.id
    STRIPE_PRODUCT_NORMAL_ID               = var.stripe_product_normal_id
    STRIPE_PRODUCT_TEST_ID                 = var.stripe_product_test_id
    SEARCH_RESULTS_NOTIFICATIONS_QUEUE_URL = aws_sqs_queue.search_results_notifications.id
    NOTIFICATION_JOBS_QUEUE_TEMPLATE_NAME  = "{notificationMedium}_notification_jobs"
    REPORT_JOBS_QUEUE_TEMPLATE_NAME        = "{reportMedium}_report_jobs"
    RAPIDAPI_KEY                           = aws_ssm_parameter.rapidapi_keys.value
  }

  tags = {
    project = "social watcher"
    env     = var.env
  }
}
