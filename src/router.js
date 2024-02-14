import express from 'express'
import controller from './controller/index.js'

const routes = express.Router()
routes.route('/ping').get(controller.ping)

// GET: either return service manifest or do reconciliation query (if ?queries parameter given)
routes.route('/reconcile').get(controller.reconcile)

// POST: do a reconciliation query
routes.route('/reconcile').post(controller.query)

// GET: do a preview
routes.route('/preview').get(controller.preview)

// GET: give a suggestion
routes.route('/suggest').get(controller.suggest)

// GET: flyout
routes.route('/suggest/flyout').get(controller.flyout)

// GET: vocabs
routes.route('/vocabs').get(controller.vocabs)

export { routes }
