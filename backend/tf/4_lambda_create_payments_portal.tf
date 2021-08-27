
locals {
  create_payments_portal_lambda_name = "create_payments_portal"
  create_payments_portal_lambda_file = "${var.out_dir}/createPaymentsPortalHandler"
}

resource "aws_lambda_function" "create_payments_portal" {
  filename         = local.create_payments_portal_lambda_file
  function_name    = local.create_payments_portal_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "3"
  source_code_hash = filebase64sha256(local.create_payments_portal_lambda_file)
  description      = "Lambda for create Payments/Stripe Portal Session"
  depends_on       = [aws_cloudwatch_log_group.create_payments_portal]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "create_payments_portal" {
  name              = "/aws/lambda/${local.create_payments_portal_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}
