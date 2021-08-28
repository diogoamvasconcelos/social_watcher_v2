
locals {
  stripe_webhook_lambda_name = "stripe_webhook"
  stripe_webhook_lambda_file = "${var.out_dir}/stripeWebhookHandler.zip"
}

resource "aws_lambda_function" "stripe_webhook" {
  filename         = local.stripe_webhook_lambda_file
  function_name    = local.stripe_webhook_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "3"
  source_code_hash = filebase64sha256(local.stripe_webhook_lambda_file)
  description      = "Lambda for the Stripe Webhook"
  depends_on       = [aws_cloudwatch_log_group.stripe_webhook]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "stripe_webhook" {
  name              = "/aws/lambda/${local.stripe_webhook_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}
