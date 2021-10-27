
locals {
  update_search_object_lambda_name = "update_search_object"
  update_search_object_lambda_file = "${var.out_dir}/updateSearchObjectHandler.zip"
}

resource "aws_lambda_function" "update_search_object" {
  filename         = local.update_search_object_lambda_file
  function_name    = local.update_search_object_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "3"
  architectures    = ["arm64"]
  source_code_hash = filebase64sha256(local.update_search_object_lambda_file)
  description      = "Updates a SearchObject"
  depends_on       = [aws_cloudwatch_log_group.update_search_object]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "update_search_object" {
  name              = "/aws/lambda/${local.update_search_object_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}
