#!/bin/sh

THIS_PATH="$(dirname "$(realpath "$0")")"

cd $THIS_PATH/../tf/ && \
	terraform workspace select $TERRAFORM_WORKSPACE
	terraform init && \
	terraform plan