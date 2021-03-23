#!/bin/sh

THIS_PATH="$(dirname "$(realpath "$0")")"

OUT_DIR=$THIS_PATH/../.out
TF_DIR=$THIS_PATH/../tf
REGION="us-east-1"
ENV="none"

env \
  OUT_DIR=$OUT_DIR \
  AWS_REGION=$REGION \
  ENV=$ENV \
  TF_VAR_out_dir=$OUT_DIR \
  TF_DIR=$TF_DIR \
  TF_VAR_tf_dir=$TF_DIR \
  TF_VAR_aws_region=$REGION \
  TF_VAR_env=$ENV \
  KEYWORDS_TABLE_NAME="keywords" \
  SEARCH_RESULTS_TABLE_NAME="search_results" \
  SEARCH_JOBS_QUEUE_TEMPLATE_NAME="{socialMedia}_search_jobs" \
  $@
