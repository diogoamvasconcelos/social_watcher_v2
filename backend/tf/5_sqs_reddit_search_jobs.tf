resource "aws_sqs_queue" "reddit_search_jobs" {
  name                       = "reddit_search_jobs"
  visibility_timeout_seconds = 30 #default
  receive_wait_time_seconds  = 20 #long polling - cost saver!
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.reddit_search_jobs_dlq.arn
    maxReceiveCount     = 5
  })

  tags = local.tags
}

resource "aws_sqs_queue" "reddit_search_jobs_dlq" {
  name                      = "reddit_search_jobs_dlq"
  message_retention_seconds = 1209600 # 14 days
  receive_wait_time_seconds = 20      #long polling - cost saver!

  tags = merge(local.tags, { QueueType = "dlq" })
}
