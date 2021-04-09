resource "aws_sqs_queue" "users_stream_consumer_dlq" {
  name                      = "users_stream_consumer_dlq"
  message_retention_seconds = 1209600 # 14 days
  receive_wait_time_seconds = 20      #long polling - cost saver!

  tags = merge(local.tags, { QueueType = "dlq" })
}
