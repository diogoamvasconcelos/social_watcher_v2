## Check the updating guides

- https://www.terraform.io/upgrade-guides/index.html

## Use `tfenv`

change version in root `.terraform-version`

- https://github.com/tfutils/tfenv#terraform-version-file

## Upgrading aws-provider

run on `tf/` (both `backend` and `frontend`)

```
terraform init -upgrade
```
