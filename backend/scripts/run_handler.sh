#!/bin/sh
THIS_PATH="$(dirname "$(realpath "$0")")"

$THIS_PATH/with_env_vars.sh yarn ts-node $1