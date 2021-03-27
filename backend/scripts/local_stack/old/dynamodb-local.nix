{ pkgs ? import ../../pkgs.nix }:

let
  dynamodb-local = pkgs.stdenv.mkDerivation {
    name = "dynamodb-local";

    src = pkgs.fetchurl {
      url =
        "https://s3.eu-central-1.amazonaws.com/dynamodb-local-frankfurt/dynamodb_local_2020-05-28.tar.gz";
      sha256 = "1jxx081z48wbiqx7lij3zi96ff9gwrhsbswkjgx95w9iv6ynp3yh";
    };
    unpackPhase = "true";

    installPhase = ''
      HOME=$PWD
      mkdir -p $out
      tar xzf $src
      mv DynamoDBLocal{.jar,_lib} $out/
    '';
  };
in pkgs.writeScriptBin "with_dynamodb_local" ''
  #!/usr/bin/env bash

  trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

  if [ -z "$DYNAMODB_PORT" ]; then
    echo The variable DYNAMODB_PORT is unset! Please set it before running this script.
    exit 1
  fi

  echo "Starting dynamodb-local on port $DYNAMODB_PORT..."
  ${pkgs.openjdk11}/bin/java -Djava.library.path=${dynamodb-local}/DynamoDBLocal_lib/ \
    -jar ${dynamodb-local}/DynamoDBLocal.jar \
    -port $DYNAMODB_PORT \
    -inMemory &

  DYNAMODB_PID=$!

  echo "Running the following command: $@"
  sleep 2
  $@
  RESPONSE=$?

  kill -15 $DYNAMODB_PID
  exit $RESPONSE
''
