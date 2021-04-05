
locals {
  get_user_lambda_name = "get_user"
}

resource "aws_lambda_function" "get_user" {
  filename         = local.lambda_file
  function_name    = local.get_user_lambda_name
  handler          = ".build/src/handlers/api/getUser.lambdaHandler"
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "15"
  source_code_hash = filebase64sha256(local.lambda_file)
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
