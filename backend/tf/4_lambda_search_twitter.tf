
locals {
  search_twitter_lambda_name = "search_twitter"
}

resource "aws_lambda_function" "search_twitter" {
  filename         = local.lambda_file
  function_name    = local.search_twitter_lambda_name
  handler          = ".build/src/handlers/searchers/searchTwitter.lambdaHandler"
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "15"
  source_code_hash = filebase64sha256(local.lambda_file)
  description      = "Searches twitter for specifc keyword"
  depends_on       = [aws_cloudwatch_log_group.search_twitter]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "search_twitter" {
  name              = "/aws/lambda/${local.search_twitter_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}

resource "aws_lambda_event_source_mapping" "twitter_search_jobs_mapping" {
  event_source_arn = aws_sqs_queue.twitter_search_jobs.arn
  function_name    = aws_lambda_function.search_twitter.arn
  batch_size       = 1
}
