- https://docs.aws.amazon.com/cli/latest/reference/cognito-idp/index.html
  - some admin stuff!!!

# list users

```
scripts/with_env.js 'aws cognito-idp list-users --user-pool-id $COGNITO_USER_POOL_ID' | jq .
```

# sign-up user

```
scripts/with_env.js 'aws cognito-idp sign-up --client-id $COGNITO_CLIENT_ID --password socialwatcherpw --username deon09+test02@gmail.com' | jq .
```

# confirm user

```
scripts/with_env.js 'aws cognito-idp confirm-sign-up --client-id $COGNITO_CLIENT_ID --username deon09+test02@gmail.com --confirmation-code 683460' | jq .
```

# sign in user

```
scripts/with_env.js 'aws cognito-idp initiate-auth --client-id $COGNITO_CLIENT_ID --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=deon09+test01@gmail.com,PASSWORD=socialwatcherpw' | jq .
```

## export ID_TOKEN

```
export ID_TOKEN=$(scripts/with_env.js 'aws cognito-idp initiate-auth --client-id $COGNITO_CLIENT_ID --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=deon09+test01@gmail.com,PASSWORD=socialwatcherpw' | jq .AuthenticationResult.IdToken)
```

## sign in using curl (doesn't work...)

```
scripts/with_env.js 'curl -X POST \
  -H "X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth" \
  -H "Content-Type: application/x-amz-json-1.1" \
  $COGNITO_CLIENT_DOMAIN \
  --data "{
    \"AuthParameters\" : {
      \"USERNAME\" : \"deon09+test01@gmail.com\",
      \"PASSWORD\" : \"socialwatcherpw\"

    \"AuthFlow\" : \"USER_PASSWORD_AUTH\",
    \"ClientId\" : $COGNITO_CLIENT_ID
  }"'
```

# TODO

- change password
- confirm change-password
- delete user
