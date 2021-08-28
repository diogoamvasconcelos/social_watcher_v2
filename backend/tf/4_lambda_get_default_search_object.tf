
locals {
  get_default_search_object_lambda_name = "get_default_search_object"
  get_default_search_object_lambda_file = "${var.out_dir}/getDefaultSearchObjectHandler.zip"
}

resource "aws_lambda_function" "get_default_search_object" {
  filename         = local.get_default_search_object_lambda_file
  function_name    = local.get_default_search_object_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "3"
  source_code_hash = filebase64sha256(local.get_default_search_object_lambda_file)
  description      = "Get a default search object"
  depends_on       = [aws_cloudwatch_log_group.get_default_search_object]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "get_default_search_object" {
  name              = "/aws/lambda/${local.get_default_search_object_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}
