import express from 'express'
import * as controller from './controller.js'

const routes = express.Router()

// In the subsequent routes, route parameters (account, dataset and ids)
//   *must not* begin with an underscore ('_').
// Fixed service endpoints, by contrast, do start with an underscore
//   ('_reconcile', '_preview', '_suggest' etc.)
// routes.route("/").get(controller.dataset)

// 1. GET: either return service manifest or do reconciliation query (if ?queries parameter given)
routes.route('/_reconcile/:account([a-zA-Z0-9][a-zA-Z0-9_-]{0,})/:dataset([a-zA-Z0-9](([a-zA-Z0-9%.:_-]|\/[^_]){0,}))').get(controller.dataset)
routes.route('/_reconcile/:account([a-zA-Z0-9][a-zA-Z0-9_-]{0,})').get(controller.dataset)
routes.route('/_reconcile').get(controller.dataset)

// 2. POST: do a reconciliation query
routes.route('/_reconcile/:account([a-zA-Z0-9][a-zA-Z0-9_-]{0,})/:dataset([a-zA-Z0-9](([a-zA-Z0-9%.:_-]|\/[^_]){0,}))').post(controller.query)
routes.route('/_reconcile/:account([a-zA-Z0-9][a-zA-Z0-9_-]{0,})').post(controller.query)
routes.route('/_reconcile').post(controller.query)

// 3. GET: do a preview
routes.route('/_preview/:account([a-zA-Z0-9][a-zA-Z0-9_-]{0,})/:dataset([a-zA-Z0-9](([a-zA-Z0-9%.:_-]|\/[^_]){0,}))(/:id([a-zA-Z0-9][a-zA-Z0-9%.:/_-]{0,}))?').get(controller.preview)
routes.route('/_preview/:account([a-zA-Z0-9][a-zA-Z0-9_-]{0,})').get(controller.preview)
routes.route('/_preview').get(controller.preview)

// 4. GET: give a suggestion
// routes.route('/_suggest/:account([a-zA-Z0-9][a-zA-Z0-9_-]{0,})/:dataset([a-zA-Z0-9](([a-zA-Z0-9%.:_-]|\/[^_]){0,}))(/:id([a-zA-Z0-9][a-zA-Z0-9%.:/_-]{0,}))?').get(controller.suggest)
// routes.route('/_suggest/:account([a-zA-Z0-9][a-zA-Z0-9_-]{0,})').get(controller.suggest)
routes.route('/_suggest/entity').get(controller.suggest)		// query parameters are: "prefix" and "cursor"

// 5. other services, not implemented yet
routes.route('/_extend/:account([a-zA-Z0-9][a-zA-Z0-9_-]{0,})/:dataset([a-zA-Z0-9](([a-zA-Z0-9%.:_-]|\/[^_]){0,}))').post(controller.extend)
routes.route('/_extend/:account([a-zA-Z0-9][a-zA-Z0-9_-]{0,})').post(controller.extend)
routes.route('/_extend').post(controller.extend)
routes.route('/_flyout/:account([a-zA-Z0-9][a-zA-Z0-9_-]{0,})/:dataset([a-zA-Z0-9](([a-zA-Z0-9%.:_-]|\/[^_]){0,}))').get(controller.flyout)
routes.route('/_flyout/:account([a-zA-Z0-9][a-zA-Z0-9_-]{0,})').get(controller.flyout)
routes.route('/_flyout').get(controller.flyout)

export { routes }
