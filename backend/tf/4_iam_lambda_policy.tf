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

  tags = local.tags
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
      "Sid": "Logs",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    },
    {
      "Sid": "SSM",
      "Action": [
        "ssm:Get*"
      ],
      "Resource": "arn:aws:ssm:*:*",
      "Effect": "Allow"
    },
    {
      "Sid": "DynamoDB",
      "Action": [
        "dynamodb:*"
      ],
      "Resource": "arn:aws:dynamodb:*:*",
      "Effect": "Allow"
    },
    {
      "Sid": "Translate",
      "Action": [
        "translate:TranslateText",
        "comprehend:DetectDominantLanguage"
      ],
      "Resource": "*",
      "Effect": "Allow"
    },
    {
      "Sid": "SQS",
      "Action": [
        "sqs:SendMessage",
        "sqs:ChangeMessageVisibility",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes",
        "sqs:GetQueueUrl",
        "sqs:ListDeadLetterSourceQueues",
        "sqs:ListQueueTags",
        "sqs:ReceiveMessage"
      ],
      "Resource": "arn:aws:sqs:*:*",
      "Effect": "Allow"
    },
    {
      "Sid": "ElasticSearch",
      "Action": [
        "es:*"
      ],
      "Resource": "arn:aws:es:*:*",
      "Effect": "Allow"
    },
    {
      "Sid": "SimpleEmailSystem",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
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
