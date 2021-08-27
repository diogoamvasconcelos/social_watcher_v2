
locals {
  search_results_stream_consumer_lambda_name = "search_results_stream_consumer"
}

resource "aws_lambda_function" "search_results_stream_consumer" {
  filename         = local.lambda_file
  function_name    = local.search_results_stream_consumer_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "3"
  source_code_hash = filebase64sha256(local.lambda_file)
  description      = "Search Results table stream consumer"
  depends_on       = [aws_cloudwatch_log_group.search_results_stream_consumer]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "search_results_stream_consumer" {
  name              = "/aws/lambda/${local.search_results_stream_consumer_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}

resource "aws_lambda_event_source_mapping" "search_results_stream_consumer" {
  event_source_arn  = aws_dynamodb_table.search_results.stream_arn
  function_name     = aws_lambda_function.search_results_stream_consumer.arn
  starting_position = "LATEST"
  batch_size        = 1
  # maximum_batching_window_in_seconds = 30 // worth for batch_sise > 1
  maximum_retry_attempts        = 5
  maximum_record_age_in_seconds = 60
  destination_config {
    on_failure {
      destination_arn = aws_sqs_queue.search_results_stream_consumer_dlq.arn
    }
  }
}
