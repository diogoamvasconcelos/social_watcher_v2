
locals {
  dispatch_search_jobs_lambda_name = "dispatch_search_jobs"
  dispatch_search_jobs_lambda_file = "${var.out_dir}/dispatchSearchJobsHandler.zip"
}

resource "aws_lambda_function" "dispatch_search_jobs" {
  filename         = local.dispatch_search_jobs_lambda_file
  function_name    = local.dispatch_search_jobs_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "256"
  timeout          = "10"
  source_code_hash = filebase64sha256(local.dispatch_search_jobs_lambda_file)
  description      = "Sends search jobs from Keywords table to SQSs"
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
