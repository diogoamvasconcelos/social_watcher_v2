
locals {
  users_stream_consumer_lambda_name = "users_stream_consumer"
}

resource "aws_lambda_function" "users_stream_consumer" {
  filename         = local.lambda_file
  function_name    = local.users_stream_consumer_lambda_name
  handler          = ".build/src/handlers/streamConsumers/usersStreamConsumer.lambdaHandler"
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "3"
  source_code_hash = filebase64sha256(local.lambda_file)
  description      = "Users table stream consumer"
  depends_on       = [aws_cloudwatch_log_group.users_stream_consumer]
  // race conditions in the handling of stream events can cause bad state (inactivate keyword than is was activate in the meanwhile)
  reserved_concurrent_executions = 1

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "users_stream_consumer" {
  name              = "/aws/lambda/${local.users_stream_consumer_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}

resource "aws_lambda_event_source_mapping" "user_stream_consumer" {
  event_source_arn  = aws_dynamodb_table.users.stream_arn
  function_name     = aws_lambda_function.users_stream_consumer.arn
  starting_position = "LATEST"
  batch_size        = 1
  # maximum_batching_window_in_seconds = 30 // worth for batch_sise > 1
  maximum_retry_attempts        = 5
  maximum_record_age_in_seconds = 60
  destination_config {
    on_failure {
      destination_arn = aws_sqs_queue.users_stream_consumer_dlq.arn
    }
  }
}
