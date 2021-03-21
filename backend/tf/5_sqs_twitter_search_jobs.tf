resource "aws_sqs_queue" "twitter_search_jobs" {
  name                       = "twitter_search_jobs"
  visibility_timeout_seconds = 30 #default
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.twitter_search_jobs_dlq.arn
    maxReceiveCount     = 5
  })

  tags = local.tags
}

resource "aws_sqs_queue" "twitter_search_jobs_dlq" {
  name                      = "twitter_search_jobs_dlq"
  message_retention_seconds = 1209600 # 14 days

  tags = merge(local.tags, { QueueType = "dlq" })
}
