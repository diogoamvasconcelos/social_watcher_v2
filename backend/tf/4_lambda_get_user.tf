
locals {
  get_user_lambda_name = "get_user"
  get_user_lambda_file = "${var.out_dir}/getUserHandler.zip"
}

resource "aws_lambda_function" "get_user" {
  filename         = local.get_user_lambda_file
  function_name    = local.get_user_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "3"
  architectures    = ["arm64"]
  source_code_hash = filebase64sha256(local.get_user_lambda_file)
  description      = "Gets user details"
  depends_on       = [aws_cloudwatch_log_group.get_user]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "get_user" {
  name              = "/aws/lambda/${local.get_user_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}
