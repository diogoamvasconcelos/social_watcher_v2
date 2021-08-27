
locals {
  search_instagram_lambda_name = "search_instagram"
}

resource "aws_lambda_function" "search_instagram" {
  filename         = local.lambda_file
  function_name    = local.search_instagram_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "15"
  source_code_hash = filebase64sha256(local.lambda_file)
  description      = "Searches instagram for specifc keyword"
  depends_on       = [aws_cloudwatch_log_group.search_instagram]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "search_instagram" {
  name              = "/aws/lambda/${local.search_instagram_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}

resource "aws_lambda_event_source_mapping" "instagram_search_jobs_mapping" {
  event_source_arn = aws_sqs_queue.instagram_search_jobs.arn
  function_name    = aws_lambda_function.search_instagram.arn
  batch_size       = 1
}
