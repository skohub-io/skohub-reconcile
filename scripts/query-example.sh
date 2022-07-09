#!/bin/sh

# Set variables to Environment variable or default values
: "${ES_PROTO:=http}"
: "${ES_HOST:=127.0.0.1}"
: "${ES_PORT:=9200}"
: "${ES_INDEX:=skohub-reconcile}"

curl --request POST \
  --url "$ES_PROTO://$ES_HOST:$ES_PORT/$ES_INDEX/_search" \
  --header 'Content-Type: application/json' \
  --data '{
    "from": 0,
    "size": 35,
		"track_total_hits": true,
    "query": {
        "bool": {
            "must": [
                {
					"bool": {
						"should": [
							{
								"term": {
									"inScheme.id": "https://w3id.org/mpilhlt/worktime_role/scheme"
								}
							},
							{
								"term": {
									"id": "https://w3id.org/mpilhlt/worktime_role/scheme"
								}
							}
						]
					}
                },
                {
                    "multi_match" : {
                        "query":    "Arbeit",
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
