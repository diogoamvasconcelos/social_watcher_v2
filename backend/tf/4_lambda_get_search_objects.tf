
locals {
  get_search_objects_lambda_name = "get_search_objects"
  get_search_objects_lambda_file = "${var.out_dir}/getSearchObjectsHandler.zip"
}

resource "aws_lambda_function" "get_search_objects" {
  filename         = local.get_search_objects_lambda_file
  function_name    = local.get_search_objects_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "3"
  architectures    = ["arm64"]
  source_code_hash = filebase64sha256(local.get_search_objects_lambda_file)
  description      = "Gets user's search objects"
  depends_on       = [aws_cloudwatch_log_group.get_search_objects]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "get_search_objects" {
  name              = "/aws/lambda/${local.get_search_objects_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}
