
locals {
  test_lambda_name = "test"
}

resource "aws_lambda_function" "test" {
  filename         = local.lambda_file
  function_name    = local.test_lambda_name
  handler          = ".build/src/handlers/test.lambdaHandler"
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "3"
  source_code_hash = filebase64sha256(local.lambda_file)
  description      = "test Lambda"
  depends_on       = [aws_cloudwatch_log_group.test]

  environment {
    variables = {
      "SOME_TABLE_NAME" = "foo"
    }
  }
}

resource "aws_cloudwatch_log_group" "test" {
  name              = "/aws/lambda/${local.test_lambda_name}"
  retention_in_days = 30
}
