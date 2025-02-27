
locals {
  remove_tag_from_result_lambda_name = "remove_tag_from_result"
  remove_tag_from_result_lambda_file = "${var.out_dir}/removeTagFromResultHandler.zip"
}

resource "aws_lambda_function" "remove_tag_from_result" {
  filename         = local.remove_tag_from_result_lambda_file
  function_name    = local.remove_tag_from_result_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "3"
  architectures    = ["arm64"]
  source_code_hash = filebase64sha256(local.remove_tag_from_result_lambda_file)
  description      = "Remove a user result tag from a search result"
  depends_on       = [aws_cloudwatch_log_group.remove_tag_from_result]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "remove_tag_from_result" {
  name              = "/aws/lambda/${local.remove_tag_from_result_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}
