locals {
  main_api_name       = "main_api"
  main_api_stage_name = "api"
}

resource "aws_api_gateway_rest_api" "main_api" {
  name        = local.main_api_name
  description = "Main REST API"
  endpoint_configuration {
    types = ["EDGE"] #https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-endpoint-types.html
  }
  body = data.template_file.main_api_openapi_spec_swagger.rendered

  tags = local.tags
}

resource "aws_api_gateway_deployment" "main_api" {
  depends_on = [
    aws_api_gateway_rest_api.main_api,
    aws_api_gateway_account.main_api,
  ]
  rest_api_id = aws_api_gateway_rest_api.main_api.id
  stage_name  = local.main_api_stage_name
}

resource "aws_api_gateway_account" "main_api" {
  cloudwatch_role_arn = aws_iam_role.main_api.arn
}

resource "aws_iam_role" "main_api" {
  name = "main_api"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "apigateway.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

  tags = local.tags
}

resource "aws_iam_policy" "main_api" {
  name        = "main_api"
  description = "IAM policy for main API Gateway - Lambda Invocations"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": "arn:aws:lambda:*:*:*",
      "Effect": "Allow"
    },
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:CreateLogGroup",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:PutLogEvents",
        "logs:GetLogEvents",
        "logs:FilterLogEvents",
        "logs:PutRetentionPolicy"
      ],
      "Resource": "*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "main_api" {
  role       = aws_iam_role.main_api.name
  policy_arn = aws_iam_policy.main_api.arn
}

resource "aws_api_gateway_method_settings" "main_api" {
  rest_api_id = aws_api_gateway_rest_api.main_api.id
  stage_name  = aws_api_gateway_deployment.main_api.stage_name
  method_path = "*/*"
  settings {
    logging_level      = "INFO"
    data_trace_enabled = true
    metrics_enabled    = true
  }
}

output "main_apigateway_base_url" {
  value = aws_api_gateway_deployment.main_api.invoke_url
}
output "main_apigateway_id" {
  value = aws_api_gateway_rest_api.main_api.id
}
