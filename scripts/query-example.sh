#!/bin/sh

curl --request POST \
  --url http://127.0.0.1:9200/skohub-reconcile/_search \
  --header 'Content-Type: application/json' \
  --data '{
    "from": 0,
    "size": 35,
        "track_total_hits": true,
    "query": {
        "bool": {
            "must": [
                {
                    "match": {
                        "tenant": "rg-mpg-de"
                    }
                },
                {
                    "match": {
                        "vocab": "polmat"
                    }
                },
                {
                    "multi_match" : {
                        "query":    "Gesell", 
                        "fields": [ "prefLabel*^4.0", "altLabel*^2.0", "hiddenLabel*^1.5","title*^3.0", "description*^1.0"] 
                    }
                }
            ],
            "should": [
                {
                    "query_string": {
                        "query": "Concept",
                        "default_field": "type"
                    }
                }
            ]
        }
    }
}
'

