- https://docs.aws.amazon.com/cli/latest/reference/cognito-idp/index.html
  - some admin stuff!!!

# list users

```
scripts/with_env.js 'aws cognito-idp list-users --user-pool-id $COGNITO_USER_POOL_ID' | jq .
```

# sign-up user

```
scripts/with_env.js 'aws cognito-idp sign-up --client-id $COGNITO_CLIENT_ID --password socialwatcherpw --username deon09+test01@gmail.com' | jq .
```

# confirm user

```
scripts/with_env.js 'aws cognito-idp confirm-sign-up --client-id $COGNITO_CLIENT_ID --username deon09+test01@gmail.com --confirmation-code 237110' | jq .
```

# sign in user

```
scripts/with_env.js 'aws cognito-idp initiate-auth --client-id $COGNITO_CLIENT_ID --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=deon09+test01@gmail.com,PASSWORD=socialwatcherpw' | jq .
```

## export ID_TOKEN

```
export ID_TOKEN=$(scripts/with_env.js 'aws cognito-idp initiate-auth --client-id $COGNITO_CLIENT_ID --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=deon09+test01@gmail.com,PASSWORD=socialwatcherpw' | jq .AuthenticationResult.IdToken)
```

# TODO

- change password
- confirm change-password
- delete user
