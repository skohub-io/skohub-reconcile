#!/bin/sh

curl --request POST \
  --url http://127.0.0.1:9200/skohub-reconcile/_search \
  --header 'Content-Type: application/json' \
  --data '{
    "from": 0,
    "size": 35,
        "track_total_hits": true,
    "query": {
        "match_all": {}
    }
}
'

