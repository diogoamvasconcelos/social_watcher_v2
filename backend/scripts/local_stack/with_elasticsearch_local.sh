#! /usr/bin/env bash

[ "${TRACE}" ] && set -o xtrace
set -o errexit -o nounset

function clean_up() {
  docker-compose -f $DOCKER_COMPOSE_FILE down
}

function main() {
  THIS_PATH="$(dirname "$(realpath "$0")")"
  DOCKER_COMPOSE_FILE=$THIS_PATH/elasticsearch_docker_compose.yaml
  echo "Starting docker_compose with $DOCKER_COMPOSE_FILE"

  docker-compose \
    -f $DOCKER_COMPOSE_FILE \
    up --detach

  echo "Running the following command: $@"
  $@

  RESPONSE=$?
  clean_up
  exit $RESPONSE
}

main $@

trap clean_up INT