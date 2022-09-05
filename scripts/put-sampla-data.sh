#!/bin/sh

# Set variables to Environment variable or default values
: "${ES_PROTO:=http}"
: "${ES_HOST:=127.0.0.1}"
: "${ES_PORT:=9200}"
: "${ES_INDEX:=skohub-reconcile}"

curl --request PUT \
  --url "$ES_PROTO://$ES_HOST:$ES_PORT/$ES_INDEX" \
  --header 'Content-Type: application/json' \
  --data @test/data/test.json
