
locals {
  add_tag_to_result_lambda_name = "add_tag_to_result"
  add_tag_to_result_lambda_file = "${var.out_dir}/addTagToResultHandler.zip"
}

resource "aws_lambda_function" "add_tag_to_result" {
  filename         = local.add_tag_to_result_lambda_file
  function_name    = local.add_tag_to_result_lambda_name
  handler          = local.lambda_handler
  role             = aws_iam_role.lambda_default.arn
  runtime          = "nodejs14.x"
  memory_size      = "128"
  timeout          = "3"
  architectures    = ["arm64"]
  source_code_hash = filebase64sha256(local.add_tag_to_result_lambda_file)
  description      = "Adds a user result tag to a search result"
  depends_on       = [aws_cloudwatch_log_group.add_tag_to_result]

  environment {
    variables = local.lambda_env_vars
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "add_tag_to_result" {
  name              = "/aws/lambda/${local.add_tag_to_result_lambda_name}"
  retention_in_days = 30

  tags = local.tags
}
