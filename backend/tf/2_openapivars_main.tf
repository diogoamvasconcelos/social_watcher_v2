data "template_file" "main_api_openapi_spec_swagger" {
  template = file("${var.tf_dir}/api/main_api_spec.yaml")

  vars = {
    main_api_role_arn = aws_iam_role.main_api.arn
    # Add lambda invoke arns below
    congnito_test_invoke_arn = aws_lambda_function.cognito_test.invoke_arn
  }
}