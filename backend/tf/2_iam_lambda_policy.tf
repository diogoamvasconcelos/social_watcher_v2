locals {
  default_lambda_role_name = "lambda_default"
}

resource "aws_iam_role" "lambda_default" {
  name = local.default_lambda_role_name

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_policy" "lambda_default" {
  name        = local.default_lambda_role_name
  path        = "/"
  description = "IAM policy for the lambdas"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    },
    {
      "Action": [
        "ssm:Get*"
      ],
      "Resource": "arn:aws:ssm:*:*",
      "Effect": "Allow"
    },
    {
      "Action": [
        "dynamodb:*"
      ],
      "Resource": "arn:aws:dynamodb:*:*",
      "Effect": "Allow"
    },
    {
      "Action": [
        "translate:TranslateText"
      ],
      "Resource": "*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_default" {
  role       = aws_iam_role.lambda_default.name
  policy_arn = aws_iam_policy.lambda_default.arn
}
