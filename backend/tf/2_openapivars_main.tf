data "template_file" "main_api_openapi_spec_swagger" {
  template = file("${var.tf_dir}/api/main_api_spec.yaml")

  vars = {
    main_api_role_arn     = aws_iam_role.main_api.arn
    cognito_pool_auth_arn = aws_cognito_user_pool.main_pool.arn
    # Add lambda invoke arns below
    get_user_invoke_arn                  = aws_lambda_function.get_user.invoke_arn
    get_search_objects_invoke_arn        = aws_lambda_function.get_search_objects.invoke_arn
    get_search_object_invoke_arn         = aws_lambda_function.get_search_object.invoke_arn
    update_search_object_invoke_arn      = aws_lambda_function.update_search_object.invoke_arn
    create_search_object_invoke_arn      = aws_lambda_function.create_search_object.invoke_arn
    delete_search_object_invoke_arn      = aws_lambda_function.delete_search_object.invoke_arn
    get_default_search_object_invoke_arn = aws_lambda_function.get_default_search_object.invoke_arn
    search_endpoint_invoke_arn           = aws_lambda_function.search_endpoint.invoke_arn
    stripe_webhook_invoke_arn            = aws_lambda_function.stripe_webhook.invoke_arn
    create_payments_portal_invoke_arn    = aws_lambda_function.create_payments_portal.invoke_arn
  }
}
