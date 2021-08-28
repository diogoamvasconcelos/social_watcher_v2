
locals {
  sync_search_results_to_es_lambda_name = "sync_search_results_to_es"
  sync_search_results_to_es_lambda_file = "${var.out_dir}/syncSearchResultsToEsHandler.zip"
}

resource "aws_lambda_function" "sync_search_results_to_es" {
  filename         = local.sync_search_results_to_es_lambda_file
  function_name    = local.sync_search_results_to_es_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "15"
  source_code_hash = filebase64sha256(local.sync_search_results_to_es_lambda_file)
  description      = "Syncs/indexes search results to elastic search"
  depends_on       = [aws_cloudwatch_log_group.sync_search_results_to_es]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "sync_search_results_to_es" {
  name              = "/aws/lambda/${local.sync_search_results_to_es_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}

resource "aws_lambda_event_source_mapping" "sync_search_results_to_es_mapping" {
  event_source_arn = aws_sqs_queue.sync_search_results_to_es.arn
  function_name    = aws_lambda_function.sync_search_results_to_es.arn
  batch_size       = 10
}
