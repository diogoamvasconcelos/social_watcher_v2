
resource "aws_cloudwatch_event_rule" "trigger_cron_report_jobs" {
  name = "trigger_cron_report_jobs"
  # https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html
  schedule_expression = "cron(16 0 * * ? *)" // runs once a day at 16:00 UTC

  tags = local.tags
}

resource "aws_cloudwatch_event_target" "dispatch_report_jobs" {
  rule = aws_cloudwatch_event_rule.trigger_cron_report_jobs.name
  arn  = aws_lambda_function.dispatch_report_jobs.arn
}

resource "aws_lambda_permission" "allow_dispatch_report_jobs_cron_invokation" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.dispatch_report_jobs.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.trigger_cron_report_jobs.arn
}

