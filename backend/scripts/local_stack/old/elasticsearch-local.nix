
{ pkgs ? import ../../pkgs.nix, ... }:

let
  elasticsearch = pkgs.dockerTools.pullImage{
    imageName = "docker.artifactory.klarna.net/elasticsearch";
    finalImageTag = "7.4.2";
    imageDigest = "sha256:ef0cdf17f8d00d8d90a7872b6672bc44283c6204e86bdf0067f93e9f637aad2a";
    sha256 = "1c9a9gizr0ikx0vy0ysd6v468la201ks959zkc6w6i4xr844z441";
  };
  
  container-name = "Elasticsearch-local";

  start_es_local = ''
    if [ -z "$ELASTICSEARCH_URL" ]; then
      echo The variable ELASTICSEARCH_URL is unset! Please set it before running this script.
      exit 1
    fi

    ELASTICSEARCH_PORT=$(echo $ELASTICSEARCH_URL | sed -e "s,^.*:,:,g" -e "s,.*:\([0-9]*\).*,\1,g" -e "s,[^0-9],,g")
    KIBANA_PORT=$(($ELASTICSEARCH_PORT + 1))

    echo "Starting a local Elasticsearch (${elasticsearch.imageName}:${elasticsearch.imageTag}) at port $ELASTICSEARCH_PORT and $KIBANA_PORT"

    docker run --rm -d --name ${container-name} -p $ELASTICSEARCH_PORT:9200 -p $KIBANA_PORT:9300 -e "discovery.type=single-node" ${elasticsearch.imageName}:${elasticsearch.imageTag}
  '';

  run_es_local_script = ''
    #!/usr/bin/env bash

    [ "$TRACE" ] && set -o xtrace
    set -o errexit -o nounset

    ${start_es_local}
  '';

  with_es_local_script = ''
    #!/usr/bin/env bash

    [ "$TRACE" ] && set -o xtrace
    set -o errexit -o nounset

    trap "docker kill ${container-name}" INT TERM ERR

    ${start_es_local}

    SCRIPT_PATH="$(dirname "$(realpath "$0")")"
    $SCRIPT_PATH/es-healthy ${container-name}

    echo "Running the following command: $@"
    
    $@
    RESPONSE=$?

    docker kill ${container-name}
    exit $RESPONSE
  '';

in pkgs.stdenv.mkDerivation {
  name = "elasticsearch-local";

  srcs = [
    ./es-healthy
  ];

  buildInputs = [ 
    pkgs.curl
    pkgs.docker
  ];

  phases = [
    "unpackPhase"
    "installPhase"
  ];

  unpackPhase = ''
    for srcFile in $srcs; do
      cp $srcFile $(stripHash $srcFile)
    done
  '';

  installPhase = ''
    HOME=$PWD
    mkdir -p $out

    cp ./* $out

    echo '${run_es_local_script}' > $out/run_es_local
    chmod +x $out/run_es_local

    echo '${with_es_local_script}' > $out/with_es_local
    chmod +x $out/with_es_local
  '';
}
