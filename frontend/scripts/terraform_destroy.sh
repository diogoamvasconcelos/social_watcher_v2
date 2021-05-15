#!/bin/sh

THIS_PATH="$(dirname "$(realpath "$0")")"

 cd $THIS_PATH/../tf/ && \
	terraform init && \
	terraform destroy