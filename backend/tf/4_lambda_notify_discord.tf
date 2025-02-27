
locals {
  notify_discord_lambda_name = "notify_discord"
  notify_discord_lambda_file = "${var.out_dir}/notifyDiscordHandler.zip"
}

resource "aws_lambda_function" "notify_discord" {
  filename         = local.notify_discord_lambda_file
  function_name    = local.notify_discord_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "15"
  architectures    = ["arm64"]
  source_code_hash = filebase64sha256(local.notify_discord_lambda_file)
  description      = "Notify to Discord the searchResults/Notification jobs"
  depends_on       = [aws_cloudwatch_log_group.notify_discord]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "notify_discord" {
  name              = "/aws/lambda/${local.notify_discord_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}

resource "aws_lambda_event_source_mapping" "notify_discord_mapping" {
  event_source_arn = aws_sqs_queue.discord_notification_jobs.arn
  function_name    = aws_lambda_function.notify_discord.arn
  batch_size       = 1
}
