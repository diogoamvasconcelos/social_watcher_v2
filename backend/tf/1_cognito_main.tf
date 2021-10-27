resource "aws_cognito_user_pool" "main_pool" {
  name = "main_pool"

  username_attributes        = ["email"]
  auto_verified_attributes   = ["email"]
  email_verification_subject = "Social Watcher account creation confirmation"
  #email_verification_message = "Here is your verification code {####}"

  schema {
    name                = "email"
    attribute_data_type = "String"
    mutable             = true
    required            = true
    string_attribute_constraints {
      min_length = 1
      max_length = 2048
    }
  }

  password_policy {
    minimum_length    = 10
    require_lowercase = false
    require_numbers   = false
    require_symbols   = false
    require_uppercase = false
  }
  lambda_config {
    pre_sign_up = aws_lambda_function.cognito_pre_signup.arn
  }

  tags = local.tags
}

resource "aws_lambda_permission" "cognito_allow_lambda_invokation" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cognito_pre_signup.arn
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main_pool.arn
}

resource "aws_cognito_user_pool_client" "main_pool_client" {
  name                   = "main_pool_client"
  user_pool_id           = aws_cognito_user_pool.main_pool.id
  refresh_token_validity = 30 #default
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH" // required for @aws-amplify/ui-react
  ]
  supported_identity_providers         = ["COGNITO"]
  prevent_user_existence_errors        = "ENABLED"
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "aws.cognito.signin.user.admin", "profile"]
  callback_urls                        = ["https://thesocialwatcher.com", "http://localhost:8080", "https://d2r5id69pzx1ip.cloudfront.net"]
  logout_urls                          = ["https://thesocialwatcher.com", "http://localhost:8080", "https://d2r5id69pzx1ip.cloudfront.net"]
}

resource "aws_cognito_user_pool_domain" "main_pool" {
  domain       = local.is_prod ? "thesocialwatcher" : "thesocialwatcher-nonprod"
  user_pool_id = aws_cognito_user_pool.main_pool.id
}

output "cognito_main_pool_user_id" {
  value = aws_cognito_user_pool.main_pool.id
}
output "cognito_main_pool_client_id" {
  value = aws_cognito_user_pool_client.main_pool_client.id
}
