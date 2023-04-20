import express from 'express'
import controller from './controller/index.js'

const routes = express.Router()
routes.route('/ping').get(controller.ping)

// GET: either return service manifest or do reconciliation query (if ?queries parameter given)
routes.route('/_reconcile').get(controller.reconcile)

// POST: do a reconciliation query
routes.route('/_reconcile').post(controller.query)

// GET: do a preview
routes.route('/_preview').get(controller.preview)

// GET: give a suggestion
routes.route('/_suggest').get(controller.suggest)

// GET: flyout
routes.route('/_suggest/_flyout').get(controller.flyout)

export { routes }
