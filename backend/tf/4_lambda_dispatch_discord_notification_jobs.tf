
locals {
  dispatch_discord_notification_jobs_lambda_name = "dispatch_discord_notification_jobs"
}

resource "aws_lambda_function" "dispatch_discord_notification_jobs" {
  filename         = local.lambda_file
  function_name    = local.dispatch_discord_notification_jobs_lambda_name
  handler          = ".build/backend/src/handlers/notifications/dispatchDiscordNotificationJobs.lambdaHandler"
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "15"
  source_code_hash = filebase64sha256(local.lambda_file)
  description      = "Dispatches Discord notification jobs"
  depends_on       = [aws_cloudwatch_log_group.dispatch_discord_notification_jobs]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "dispatch_discord_notification_jobs" {
  name              = "/aws/lambda/${local.dispatch_discord_notification_jobs_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}

resource "aws_lambda_event_source_mapping" "dispatch_discord_notification_jobs_mapping" {
  event_source_arn = aws_sqs_queue.search_results_to_discord.arn
  function_name    = aws_lambda_function.dispatch_discord_notification_jobs.arn
  batch_size       = 10
}
