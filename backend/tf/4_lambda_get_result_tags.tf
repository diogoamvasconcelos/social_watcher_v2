
locals {
  get_results_tags_lambda_name = "get_results_tags"
  get_results_tags_lambda_file = "${var.out_dir}/getResultTagsHandler.zip"
}

resource "aws_lambda_function" "get_results_tags" {
  filename         = local.get_results_tags_lambda_file
  function_name    = local.get_results_tags_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "3"
  source_code_hash = filebase64sha256(local.get_results_tags_lambda_file)
  description      = "Gets user's result tags"
  depends_on       = [aws_cloudwatch_log_group.get_results_tags]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "get_results_tags" {
  name              = "/aws/lambda/${local.get_results_tags_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}
