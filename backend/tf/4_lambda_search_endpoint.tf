
locals {
  search_endpoint_lambda_name = "search_endpoint"
  search_endpoint_lambda_file = "${var.out_dir}/searchHandler.zip"
}

resource "aws_lambda_function" "search_endpoint" {
  filename         = local.search_endpoint_lambda_file
  function_name    = local.search_endpoint_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "5"
  architectures    = ["arm64"]
  source_code_hash = filebase64sha256(local.search_endpoint_lambda_file)
  description      = "Lambda for the search endpoint"
  depends_on       = [aws_cloudwatch_log_group.search_endpoint]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "search_endpoint" {
  name              = "/aws/lambda/${local.search_endpoint_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}
