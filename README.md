# Build

![https://github.com/mpilhlt/skohub-reconcile/actions?query=workflow%3ABuild](https://github.com/mpilhlt/skohub-reconcile/workflows/Build/badge.svg?branch=main)

## skohub-reconcile

This repository provides a [Reconciliation Service](https://reconciliation-api.github.io/specs/latest/)
for the the [SkoHub](http://skohub.io) core infrastructure.

Dependencies:

- elasticsearch 7.0
- node-version >= v14.x

Basic setup:

    $ git clone https://github.com/rg-mpg-de/skohub-reconcile.git
    $ cd skohub-reconcile
    # - Copy `sample.env` to `.env` and adjust values therein
    # - When you run skohub-reconcile, the necessary elasticsearch
    #     index should be created automatically. If it isn't, or if
    #     you want to recreate it later manually, use a PUT request
    #     to submit the mapping, e.g. with curl:
    #   > curl -X PUT -H "Content-Type: application/json" \
    #     --url "localhost:9200/skohub-reconcile" \
    #     -d @src/esSchema.json
    # - Configure/install the necessary node.js modules:
    $ npm ci
    # - Run skohub-reconcile:
    $ npm start

This will start the Reconciliation service on the port specified with `APP_PORT` in `.env`. It accepts
queries according to the [Reconciliation Service specification](https://reconciliation-api.github.io/specs/latest/)
at endpoints corresponding to all hosted vocabularies, e.g. `/project/vocab`, `/class/esc`, or `/rg-mpg-de/polmat` etc.

Currently only reconciliation queries are supported. Preview, suggestion and data extensions support is on the roadmap.

The elasticsearch server must be populated when a vocabulary is published on skohub. This present service creates an
appropriate index and takes PUT requests from skohub-vocabs, adding resources to the elasticsearch index.

Here are setup instructions for using [vocabs-polmat](https://github.com/rg-mpg-de/vocabs-polmat):

    $ git clone https://github.com/rg-mpg-de/skohub-vocabs.git
    $ cd skohub-vocabs
    $ git checkout feature-reconc
    # Copy `.env.sample` to `.env` and adjust values therein
    $ cd data
    $ wget https://raw.githubusercontent.com/rg-mpg-de/vocabs-polmat/main/polmat.ttl
    $ cd ..
    $ npm ci
    $ npm run populate-reconc

You can then POST queries to the server started in `skohub-reconcile`, e.g.

    curl -X POST --data 'queries={"q1":{"query":"Bank"}}' http://localhost:3000/rg-mpg-de/polmat

Also, GET queries are supported, e.g.

    curl -X GET --url 'https:///w3id.org/mpilhlt/reconcile/worktime_role?queries=%7B%22qPause%22%3A%7B%22query%22%3A%22W%C3%B6chnerin%22%7D%7D'

(This may be handy if your reconciliation service is behind a 302-redirection
that makes your client translate all POST requests to GET ones. In this case,
the POST request's body would be lost and it is better to send a GET request
in the first place. But all the curly crackets, quotation marks etc. have to
be url-escaped.)

## elasticsearch
You need to run a properly configured `elasticsearch` instance by
setting `cluster.name: skohub`. See the provided [elasticsearch.yml](scripts/etc/elasticsearch/elasticsearch.yml).
Also, in some contexts, it's mandatory to initialize elasticsearch with a proper
[index-mapping](scripts/elasticsearch-mappings.json).

## start scripts
You may want to use the start script in `scripts/start.sh`. This script ensures the proper
installation of skohub-reconcile and the configuration of elasticsearch. There also reside
further scripts to manage the starting/stopping of the skohub-reconcile via init and to
monitor the processes with `monit`.

## Credits
The project to add a Reconciliation Service to SkoHub has been initiated by Andreas Wagner and
carried out in cooperation with the [SkoHub.io team](https://github.com/skohub-io) in 2021/2022.
