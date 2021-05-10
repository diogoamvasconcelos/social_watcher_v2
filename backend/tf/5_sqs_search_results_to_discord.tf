resource "aws_sqs_queue" "search_results_to_discord" {
  name                       = "search_results_to_discord"
  visibility_timeout_seconds = 30 #default
  receive_wait_time_seconds  = 20 #long polling - cost saver!
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.search_results_to_discord_dlq.arn
    maxReceiveCount     = 5
  })

  tags = local.tags
}

resource "aws_sqs_queue" "search_results_to_discord_dlq" {
  name                      = "search_results_to_discord_dlq"
  message_retention_seconds = 1209600 # 14 days
  receive_wait_time_seconds = 20      #long polling - cost saver!

  tags = merge(local.tags, { QueueType = "dlq" })
}
