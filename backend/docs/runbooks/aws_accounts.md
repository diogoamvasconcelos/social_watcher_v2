# AWS Accounts

- Create all accounts under the same Organization for simplified management (billing, etc)

- Add a Profile and a User (Access and Secret keys) to `~/.aws/credentials` and `~/.aws/config`
  - more info: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html
  - to get the keys, create a "Admin user" with `AdministratorAccess` policy on the `IAM` console
  - to control what user is active, use the env var `AWS_PROFILE`
