
locals {
  cognito_test_lambda_name = "cognito_test"
}

resource "aws_lambda_function" "cognito_test" {
  filename         = local.lambda_file
  function_name    = local.cognito_test_lambda_name
  handler          = ".build/src/handlers/cognitoTest.lambdaHandler"
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "15"
  source_code_hash = filebase64sha256(local.lambda_file)
  description      = "Test"
  depends_on       = [aws_cloudwatch_log_group.cognito_test]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "cognito_test" {
  name              = "/aws/lambda/${local.cognito_test_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}