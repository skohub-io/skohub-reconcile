# skohub-reconcile

![https://github.com/mpilhlt/skohub-reconcile/actions?query=workflow%3ABuild](https://github.com/mpilhlt/skohub-reconcile/workflows/Build/badge.svg?branch=main)

This repository provides a [Reconciliation Service](https://reconciliation-api.github.io/specs/latest/)
for the the [SkoHub](http://skohub.io) core infrastructure.

Dependencies:

- elasticsearch 7.0
- node-version >= v14.x

## Basic setup

Make sure your elasticsearch server is running and properly configured. (For instance,
it needs to have `cluster.name: skohub` set. See the provided
[elasticsearch.yml](scripts/etc/elasticsearch/elasticsearch.yml).)

Then:

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

This will start the Reconciliation service on the port specified with `APP_PORT` in `.env`.

## Querying the service

The skohub reconcile service accepts queries according to the [Reconciliation Service specification](https://reconciliation-api.github.io/specs/latest/) at endpoints created below the url specified in `.env` in `APP_BASEURL`.

Projects are managed based on a "tenant" account and the respective vocabulary's URI - taken either from the ConceptScheme's `http://purl.org/vocab/vann/preferredNamespaceUri` property or from the ConceptScheme's `id` value up to and including the last forward slash `/`. For a `tenant` called "jdoe" and a vocabulary "http://w3id.org/jdoe/my-vocab", the following three levels of endpoints are provided:

- `$APP_BASEURL/`:
  - `GET` gives a manifest for the whole collection of vocabularies hosted by this service. In addition to regular [reconciliation manifest](https://reconciliation-api.github.io/specs/latest/#service-manifest) fields, it features a field `vocabs` that contains an array of vocabulary objects, each of which has `id`, (multilingual) `title`, (multilingual) `description` and `reconciliation` fields - with the latter pointing to the reconciliation endpoint for this vocabulary. If you pass a `?queries` query parameter with the url (e.g. `?queries={"q1":{"query":"needle"}}`) then it behaves like the POST request and answers the [reconciliation query](https://reconciliation-api.github.io/specs/latest/#reconciliation-queries).
  - `POST` accepts [reconciliation queries](https://reconciliation-api.github.io/specs/latest/#reconciliation-queries) for vocabularies hosted by the service.
  - `$APP_BASEURL/_preview`: needs to be complemented with a full `/tenant/vocab` path (e.g. `$APP_BASEURL/_preview/jdoe/http://w3id.org/jdoe/my-vocab`) and responds with a html preview of the vocabulary to `GET` requests.
  - `$APP_BASEURL/_suggest/entity` takes a `prefix` query parameter and provides suggestions for completing the specified prefix with vocabularies from the service.

- `$APP_BASEURL/jdoe`:
  - `GET` gives a manifest for all vocabularies of this tenant ("jdoe") hosted by this service. In addition to regular [reconciliation manifest](https://reconciliation-api.github.io/specs/latest/#service-manifest) fields, it features a field `vocabs` that contains an array of vocabulary objects, each of which has `id`, (multilingual) `title`, (multilingual) `description` and `reconciliation` fields - with the latter pointing to the reconciliation endpoint for this vocabulary. If you pass a `?queries` query parameter with the url (e.g. `?queries={"q1":{"query":"needle"}}`) then it behaves like the POST request and answers the [reconciliation query](https://reconciliation-api.github.io/specs/latest/#reconciliation-queries).
  - `POST` accepts [reconciliation queries](https://reconciliation-api.github.io/specs/latest/#reconciliation-queries) for this tenant's vocabularies hosted by the service.
  - `$APP_BASEURL/jdoe/_preview`: needs to be complemented with a full `/vocab` or `/vocab/conceptid` path (e.g. `$APP_BASEURL/jdoe/_preview/http%3A%2F%2Fw3id.org%2Fjdoe%2Fmy-vocab/concept1`) and responds with a html preview of the vocabulary or concept to `GET` requests.

- `$APP_BASEURL/jdoe/http://w3id.org/jdoe/my-vocab`:
  - `GET` gives a manifest for this vocabulary. If you pass a `?queries` query parameter with the url (e.g. `?queries={"q1":{"query":"needle"}}`) then it behaves like the POST request and answers the [reconciliation query](https://reconciliation-api.github.io/specs/latest/#reconciliation-queries). E.g.: `curl -X GET --url 'https:///w3id.org/jdoe/reconcile/my-vocab?queries=%7B%22q1%22%3A%7B%22query%22%3A%22needle%22%7D%7D'`
  (This may be handy if your reconciliation service is behind a 302-redirection that makes
  your client translate all POST requests to GET ones. In this case, the POST request's body
  would be lost and it is better to send a GET request in the first place. But all the curly
  brackets, quotation marks etc. have to be url-escaped.)

  - `POST` accepts [reconciliation queries](https://reconciliation-api.github.io/specs/latest/#reconciliation-queries) for this vocabulary. E.g.: `curl -X POST --data 'queries={"q1":{"query":"needle"}}' http://localhost:3000/jdoe/http://w3id.org/jdoe/my-vocab`
  - `$APP_BASEURL/jdoe/http://w3id.org/jdoe/my-vocab/_preview`: needs to be complemented with a `/conceptid` path (e.g. `$APP_BASEURL/jdoe/http://w3id.org/jdoe/my-vocab/_preview/concept1`) and responds with a html preview of the vocabulary or concept to `GET` requests.
  - `$APP_BASEURL/jdoe/http://w3id.org/jdoe/my-vocab/_suggest/entity`: needs to be complemented with a `?prefix=nee` query and responds to `GET` requests with a list of autocomplete suggestions for the specified prefix (an array of objects each containing `name` and `id` fields).

In reconciliation query endpoints, a query parameter "lang" is supported that gives descriptions or labels in the language specified - if the vocabulary features information in that language.

Currently only reconciliation, preview and suggestion queries are supported. Data extensions support is on the roadmap.

## Populating the service with data

The elasticsearch server must be populated by means other than this service itself.
One possibility is to use a version of skohub-vocabs that integrates the
reconciliation population function to publish your vocabulary.

Here are setup instructions for using skohub-vocabs' [reconc feature branch](https://github.com/mpilhlt/skohub-vocabs/tree/feature-reconc) with the [vocabs-polmat](https://github.com/rhonda-org/vocabs-polmat) vocabulary:

    $ git clone https://github.com/mpilhlt/skohub-vocabs.git
    $ cd skohub-vocabs
    $ git checkout feature-reconc
    # Copy `.env.sample` to `.env` and adjust values therein
    $ cd data
    $ wget https://raw.githubusercontent.com/rhonda-org/vocabs-polmat/main/polmat.ttl
    $ cd ..
    $ npm ci
    $ npm run populate-reconc

## Scripts

In the `scripts` folder, there are some example scripts to manage and interact with your
elasticsearch instance.

## Credits
The project to add a Reconciliation Service to SkoHub has been initiated by Andreas Wagner and
carried out in cooperation with the [SkoHub.io team](https://github.com/skohub-io) in 2021/2022.
