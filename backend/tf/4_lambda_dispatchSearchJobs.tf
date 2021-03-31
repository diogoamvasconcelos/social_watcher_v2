
locals {
  dispatch_search_jobs_lambda_name = "dispatch_search_jobs"
}

resource "aws_lambda_function" "dispatch_search_jobs" {
  filename         = local.lambda_file
  function_name    = local.dispatch_search_jobs_lambda_name
  handler          = ".build/src/handlers/dispatchSearchJobs.lambdaHandler"
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "3"
  source_code_hash = filebase64sha256(local.lambda_file)
  description      = "Send search jobs from Keywords table to SQSs"
  depends_on       = [aws_cloudwatch_log_group.dispatch_search_jobs]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "dispatch_search_jobs" {
  name              = "/aws/lambda/${local.dispatch_search_jobs_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}
