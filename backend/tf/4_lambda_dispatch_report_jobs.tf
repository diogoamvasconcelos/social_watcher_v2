
locals {
  dispatch_report_jobs_lambda_name = "dispatch_report_jobs"
}

resource "aws_lambda_function" "dispatch_report_jobs" {
  filename         = local.lambda_file
  function_name    = local.dispatch_report_jobs_lambda_name
  handler          = ".build/src/handlers/reports/dispatchReportJobs.lambdaHandler"
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "256"
  timeout          = "10"
  source_code_hash = filebase64sha256(local.lambda_file)
  description      = "Queues Report jobs for users that requested reports on specific keywords to SQSs"
  depends_on       = [aws_cloudwatch_log_group.dispatch_report_jobs]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "dispatch_report_jobs" {
  name              = "/aws/lambda/${local.dispatch_report_jobs_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}
