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
    aws_api_gateway_account.main_api,
    aws_cloudwatch_log_group.main_api,
  ]
  rest_api_id = aws_api_gateway_rest_api.main_api.id
  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.main_api.body))
  }
  lifecycle {
    create_before_destroy = true
  }
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
  stage_name  = aws_api_gateway_stage.main_api.stage_name
  method_path = "*/*"
  settings {
    logging_level      = "INFO"
    data_trace_enabled = true
    metrics_enabled    = true
  }
}

resource "aws_api_gateway_stage" "main_api" {
  stage_name    = local.main_api_stage_name
  rest_api_id   = aws_api_gateway_rest_api.main_api.id
  deployment_id = aws_api_gateway_deployment.main_api.id
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.main_api.arn
    format = jsonencode({
      "api_id" : "$context.apiId",
      "domain_name" : "$context.domainName",
      "http_method" : "$context.httpMethod",
      "request_id" : "$context.requestId",
      "request_path" : "$context.path",
      "request_time" : "$context.requestTime",
      "resource_id" : "$context.resourceId",
      "resource_path" : "$context.resourcePath",
      "source_ip" : "$context.identity.sourceIp",
      "stage" : "$context.stage",
      "user_agent" : "$context.identity.userAgent",
      "status" : "$context.status",
    }) # overridden by deployApiGateway function ??
  }
}

resource "aws_cloudwatch_log_group" "main_api" {
  name              = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.main_api.id}/${local.main_api_stage_name}"
  retention_in_days = 30
}

output "main_apigateway_base_url" {
  value = aws_api_gateway_deployment.main_api.invoke_url
}
output "main_apigateway_id" {
  value = aws_api_gateway_rest_api.main_api.id
}
