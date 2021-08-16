
locals {
  get_search_object_lambda_name = "get_search_object"
}

resource "aws_lambda_function" "get_search_object" {
  filename         = local.lambda_file
  function_name    = local.get_search_object_lambda_name
  handler          = ".build/src/handlers/api/getSearchObject.lambdaHandler"
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "3"
  source_code_hash = filebase64sha256(local.lambda_file)
  description      = "Gets user's search object by index"
  depends_on       = [aws_cloudwatch_log_group.get_search_object]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "get_search_object" {
  name              = "/aws/lambda/${local.get_search_object_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}
