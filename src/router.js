import express from 'express'
import * as controller from './controller.js'

const routes = express.Router()

// vocab endpoints: query for concepts inside vocabularies/conceptSchemes
// routes.route('/:tenant/:vocab').get(controller.vocab) // either do a query (if ?queries parameter given), or return service manifest
// routes.route('/:tenant/:vocab').post(controller.query)
routes.route('/:vocab*/reconcile').get(controller.vocab) // either do a query (if ?queries parameter given), or return service manifest
routes.route('/:vocab*/reconcile').post(controller.query)

// routes.route('/:tenant/:vocab/suggest').get(controller.suggest)
// routes.route('/:tenant/:vocab/extend').post(controller.extend)
// routes.route('/:tenant/:vocab/preview').get(controller.preview)
// routes.route('/:tenant/:vocab/flyout').get(controller.flyout)

// TODO: root endpoint: query for vocabularies/conceptSchemes
// routes.route('/').get(controller.root_manifest)
// routes.route('/').post(controller.root_query)

// TODO: check for undefined tenants/vocabularies and report 404

export { routes }
