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

  tags = local.tags
}
