
locals {
  search_youtube_lambda_name = "search_youtube"
  search_youtube_lambda_file = "${var.out_dir}/searchYoutubeHandler.zip"
}

resource "aws_lambda_function" "search_youtube" {
  filename         = local.search_youtube_lambda_file
  function_name    = local.search_youtube_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "15"
  architectures    = ["arm64"]
  source_code_hash = filebase64sha256(local.search_youtube_lambda_file)
  description      = "Searches youtube for specifc keyword"
  depends_on       = [aws_cloudwatch_log_group.search_youtube]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "search_youtube" {
  name              = "/aws/lambda/${local.search_youtube_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}

resource "aws_lambda_event_source_mapping" "youtube_search_jobs_mapping" {
  event_source_arn = aws_sqs_queue.youtube_search_jobs.arn
  function_name    = aws_lambda_function.search_youtube.arn
  batch_size       = 1
}
