
resource "aws_cloudwatch_event_rule" "trigger_cron_search_jobs" {
  name                = "trigger_cron_search_jobs"
  schedule_expression = local.is_prod ? "rate(5 minutes)" : "rate(360 minutes)"

  tags = local.tags
}

resource "aws_cloudwatch_event_target" "dispatch_search_jobs" {
  rule = aws_cloudwatch_event_rule.trigger_cron_search_jobs.name
  arn  = aws_lambda_function.dispatch_search_jobs.arn
}

resource "aws_lambda_permission" "allow_dispatch_search_jobs_cron_invokation" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.dispatch_search_jobs.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.trigger_cron_search_jobs.arn
}
