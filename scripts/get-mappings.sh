#!/bin/sh

curl --request GET \
  --url http://127.0.0.1:9200/skohub-reconcile/_mappings \
  --header 'Content-Type: application/json'

