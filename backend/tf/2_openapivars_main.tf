data "template_file" "main_api_openapi_spec_swagger" {
  template = file("${var.tf_dir}/api/main_api_spec.yaml")

  vars = {
    main_api_role_arn = aws_iam_role.main_api.arn
    cognito_pool_auth_arn = aws_cognito_user_pool.main_pool.arn
    # Add lambda invoke arns below
    cognito_test_invoke_arn = aws_lambda_function.cognito_test.invoke_arn
    get_user_invoke_arn = aws_lambda_function.get_user.invoke_arn
  }
}