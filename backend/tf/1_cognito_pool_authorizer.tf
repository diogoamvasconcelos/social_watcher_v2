resource "aws_api_gateway_authorizer" "cognito_pool" {
  name          = "cognito_pool"
  rest_api_id   = aws_api_gateway_rest_api.main_api.id
  type          = "COGNITO_USER_POOLS"
  provider_arns = [aws_cognito_user_pool.main_pool.arn]
}
