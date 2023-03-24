import express from 'express'
import controller from './controller/index.js'

const routes = express.Router()

// In the subsequent routes, route parameters (account, dataset and ids)
//   *must not* begin with an underscore ('_').
// Fixed service endpoints, by contrast, do start with an underscore
//   ('_reconcile', '_preview', '_suggest' etc.)
// routes.route("/").get(controller.dataset)

// GET: either return service manifest or do reconciliation query (if ?queries parameter given)
routes.route('/_reconcile').get(controller.reconcile)

// POST: do a reconciliation query
routes.route('/_reconcile').post(controller.query)

// GET: do a preview
routes.route('/_preview').get(controller.preview)

// GET: give a suggestion
routes.route('/_suggest').get(controller.suggest)

// GET: flyout
routes.route('/_suggest/_flyout/:id').get(controller.flyout)

export { routes }
