#!/usr/bin/env bash

[[ "${TRACE}" ]] && set -o xtrace
set -o errexit -o pipefail -o nounset

print_error() {
  local msg="$1"
  local command="${0##*/}"
  >&2 echo "${command}: error: ${msg}"
}

docker_compose_container_id() {
  docker-compose ps -q "$1"
}

container_exists() {
  docker-compose ps --services --filter status=running | grep -q "$1"
}

wait_for_container() {
  local container container_id timeout
  container="$1"
  timeout="$2"

  container_id="$(docker_compose_container_id "${container}")"

  >&2 echo -n "Waiting for ${container} to start..."
  wait_time=0
  until container_running "${container_id}"
  do
    sleep 0.5
    >&2 echo -n .
    sleep 0.5

    if container_exited "${container_id}"
    then
      >&2 echo FAIL!
      print_error "container exited during startup"
      >&2 docker logs "${container_id}"
      return 1
    fi

    wait_time=$((wait_time + 1))
    if [[ "${wait_time}" -gt "${timeout}" ]]
    then
      >&2 echo FAIL!
      print_error "timeout reached (${timeout}s), aborting..."
      return 1
    fi
  done
  >&2 echo OK!
}

wait_for_healthy() {
  local container container_id timeout wait_time
  container="$1"
  timeout="$2"
  container_id="$(docker_compose_container_id "${container}")"

  >&2 echo -n "Waiting for ${container} to be healthy..."
  wait_time=0
  until container_healthy "${container_id}"
  do
    sleep 0.5
    >&2 echo -n .
    sleep 0.5

    if container_exited "${container_id}"
    then
      >&2 echo FAIL!
      print_error "container exited during startup"
      >&2 docker logs "${container_id}"
      return 1
    fi

    if container_keeps_failing "${container_id}" "30"; then
      >&2 echo FAIL!
      print_error "container keeps failing health check, aborting..."
      >&2 docker logs "${container_id}"
      return 1
    fi

    wait_time=$((wait_time + 1))
    if [[ "${wait_time}" -gt "${timeout}" ]]
    then
      >&2 echo FAIL!
      print_error "timeout reached (${timeout}s), aborting..."
      return 1
    fi
  done
  >&2 echo OK!
}

container_id_exists() {
  [[ -n "$(docker ps -aq -f "id=$1")" ]]
}

container_name_exists() {
  [[ -n "$(docker ps -aq -f "name=^/$1\$")" ]]
}

container_running() {
  [[ "true" = "$(docker inspect -f '{{.State.Running}}' "$1")" ]]
}

container_exited() {
  [[ "exited" = "$(docker inspect -f '{{.State.Status}}' "$1")" ]]
}

container_keeps_failing() {
  local container="$1" failures="$2"
  [[ "${failures}" -lt "$(docker inspect -f '{{.State.Health.FailingStreak}}' "${container}")" ]] 2>/dev/null
}

container_healthy() {
  local address
  # get addresses > first line > select ip > remove bracers (front) > remove bracers (back) > join into good ip (with `:`)
  address=$(docker inspect elasticsearch-local -f '{{range $k, $v := .NetworkSettings.Ports}}{{printf "%s\n" $v}}{{end}}' | head -n1 | grep -oP '\[\{.*?\}' |  sed 's/^..//' | sed 's/.$//' | sed -e 's/\s\+/:/g')

  curl -s ${address} 2>&1 > /dev/null
}

main() {
  THIS_PATH="$(dirname "$(realpath "$0")")"
  cd $THIS_PATH

  local timeout wait_time
  timeout=90

  while getopts :t: opt
  do
    case "${opt}" in
      t)   timeout="${OPTARG}" ;;
      '?') print_error "invalid option -- '${OPTARG}'"; return 1;;
      :)   print_error "option requires an argument -- '${OPTARG}'"; return 1;;
    esac
  done
  shift "$((OPTIND - 1))"

  if [[ $# -lt 1 ]]
  then
    print_error no container name or id provided
    exit 1
  fi

  for container in "$@"
  do
    >&2 echo -n Verifying existence of container "${container}"...
    if ! container_exists "${container}"
    then
      >&2 echo FAIL!
      print_error "no container matching '${container}'"
      return 1
    fi
    echo OK!
  done

  for container in "$@"
  do
    wait_for_container "${container}" "${timeout}"
    wait_for_healthy "${container}" "${timeout}"
  done

  >&2 echo All services have started!
}

main "$@"