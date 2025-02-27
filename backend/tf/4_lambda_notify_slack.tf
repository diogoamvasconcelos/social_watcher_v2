
locals {
  notify_slack_lambda_name = "notify_slack"
  notify_slack_lambda_file = "${var.out_dir}/notifySlackHandler.zip"
}

resource "aws_lambda_function" "notify_slack" {
  filename         = local.notify_slack_lambda_file
  function_name    = local.notify_slack_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "15"
  architectures    = ["arm64"]
  source_code_hash = filebase64sha256(local.notify_slack_lambda_file)
  description      = "Notify to Slack the searchResults/Notification jobs"
  depends_on       = [aws_cloudwatch_log_group.notify_slack]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "notify_slack" {
  name              = "/aws/lambda/${local.notify_slack_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}

resource "aws_lambda_event_source_mapping" "notify_slack_mapping" {
  event_source_arn = aws_sqs_queue.slack_notification_jobs.arn
  function_name    = aws_lambda_function.notify_slack.arn
  batch_size       = 1
}
