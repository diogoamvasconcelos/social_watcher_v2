
locals {
  cognito_pre_signup_lambda_name = "cognito_pre_signup"
}

resource "aws_lambda_function" "cognito_pre_signup" {
  filename         = local.lambda_file
  function_name    = local.cognito_pre_signup_lambda_name
  handler          = ".build/src/handlers/cognitoPreSignup.lambdaHandler"
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "15"
  source_code_hash = filebase64sha256(local.lambda_file)
  description      = "Pre-signup lambda for cognito user pool."
  depends_on       = [aws_cloudwatch_log_group.cognito_pre_signup]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "cognito_pre_signup" {
  name              = "/aws/lambda/${local.cognito_pre_signup_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}
