
locals {
  dispatch_notification_jobs_lambda_name = "dispatch_notification_jobs"
  dispatch_notification_jobs_lambda_file = "${var.out_dir}/dispatchNotificationJobsHandler"
}

resource "aws_lambda_function" "dispatch_notification_jobs" {
  filename         = local.dispatch_notification_jobs_lambda_file
  function_name    = local.dispatch_notification_jobs_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "256"
  timeout          = "15"
  source_code_hash = filebase64sha256(local.dispatch_notification_jobs_lambda_file)
  description      = "Dispatches Notification jobs for the different notification mediums"
  depends_on       = [aws_cloudwatch_log_group.dispatch_notification_jobs]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "dispatch_notification_jobs" {
  name              = "/aws/lambda/${local.dispatch_notification_jobs_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}

resource "aws_lambda_event_source_mapping" "dispatch_notification_jobs_mapping" {
  event_source_arn = aws_sqs_queue.search_results_notifications.arn
  function_name    = aws_lambda_function.dispatch_notification_jobs.arn
  batch_size       = 10
}
