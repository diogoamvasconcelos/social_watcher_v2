#!/bin/sh
# how to run: scripts/with_env.js 'scripts/infra_ops/import_terraform_resource.sh' --env prod

THIS_PATH="$(dirname "$(realpath "$0")")"

cd $THIS_PATH/../../tf/ && \
	terraform workspace select $TERRAFORM_WORKSPACE && \
	terraform import aws_ssm_parameter.rapidapi_keys rapidapi_keys