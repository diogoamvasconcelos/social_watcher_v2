
locals {
  report_email_lambda_name = "report_email"
}

resource "aws_lambda_function" "report_email" {
  filename         = local.lambda_file
  function_name    = local.report_email_lambda_name
  handler          = ".build/src/handlers/reports/reportEmail.lambdaHandler"
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "256"
  timeout          = "15"
  source_code_hash = filebase64sha256(local.lambda_file)
  description      = "Send reports by Email for report jobs"
  depends_on       = [aws_cloudwatch_log_group.report_email]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "report_email" {
  name              = "/aws/lambda/${local.report_email_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}

resource "aws_lambda_event_source_mapping" "report_email_mapping" {
  event_source_arn = aws_sqs_queue.email_report_jobs.arn
  function_name    = aws_lambda_function.report_email.arn
  batch_size       = 1
}
