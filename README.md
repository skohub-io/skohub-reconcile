# SkoHub Reconcile

This repository provides a [Reconciliation Service](https://reconciliation-api.github.io/specs/latest/) for the the [SkoHub](http://skohub.io) core infrastructure.

The module is designed to serve SKOS Vocabularies according to the [Reconciliation Service](https://reconciliation-api.github.io/specs/latest/) specification.
To insert vocabularies to the service, you can use the [SkoHub Reconcile Publish](https://github.com/skohub-io/skohub-reconcile-publish) module.

The Service currently suppports the following reconciliation services of the above mentioned specification:

- [Service Definition](https://reconciliation-api.github.io/specs/0.2/#service-definition)
- [Reconciliation Queries](https://reconciliation-api.github.io/specs/0.2/#reconciliation-queries)
- [Preview Service](https://reconciliation-api.github.io/specs/0.2/#preview-service)
- [Suggest Services](https://reconciliation-api.github.io/specs/0.2/#suggest-services)
- [Flyout Services](https://reconciliation-api.github.io/specs/0.2/#flyout-services)

Be aware that this is still in proof-of-concept phase.

## Setup

This service uses docker and docker-compose to run. 
To run it, you need to have docker and docker-compose installed.
Please see the [docker installation guide](https://docs.docker.com/install/) and the [docker-compose installation guide](https://docs.docker.com/compose/install/) for more information.

To run the service, you need to have a `.env` file in the root directory of the project.
You can use the provided `sample.env` as a template.

Then, you can run the service with:

    $ docker compose up

This will start the Reconciliation service on the port specified with `APP_PORT` in `.env`. 
Add `-d` to run the service in the background.
Note that the Elasticsearch and Kibana services will also be exposed.

If you start the service for the first time an index with the appropriate mapping will be created automatically.
If you want to reset the index later, you can use the following command:

    $ docker compose run --rm reconcile npm run reset-index

## Development

For development you might want to start the service with `npm run dev`.
In order to find the elasticsearch, you have to change the `ES_HOST` in the `.env` file to `localhost`.

## Credits
The project to add a Reconciliation Service to SkoHub has been initiated by Andreas Wagner and
carried out in cooperation with the [SkoHub.io team](https://github.com/skohub-io) in 2021/2022.
